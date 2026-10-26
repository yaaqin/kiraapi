import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload, PublicUser } from './auth.types.js';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: PublicUser;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest();

@Injectable()
export class AuthService {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    const days = Number(config.get('REFRESH_TOKEN_TTL_DAYS') ?? 7);
    this.refreshTtlMs = days * 24 * 60 * 60 * 1000;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    const valid =
      user?.isActive && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedException('Email atau password salah');
    }
    return this.issueTokens(user);
  }

  /**
   * Rotates the refresh token: the presented token is revoked and a new pair is
   * issued. Presenting an already-revoked token is treated as theft, so every
   * session of that user is revoked.
   */
  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    const parsed = this.parseRefreshToken(rawToken);
    if (!parsed) throw new UnauthorizedException('Invalid refresh token');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: parsed.id },
      include: { user: true },
    });
    if (
      !stored ||
      !timingSafeEqual(
        Buffer.from(stored.tokenHash, 'hex'),
        sha256(parsed.secret),
      )
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Refresh token reused');
    }
    if (stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Conditional update so two concurrent refreshes cannot both succeed.
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw new UnauthorizedException('Refresh token reused');

    return this.issueTokens(stored.user);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    const parsed = this.parseRefreshToken(rawToken);
    if (!parsed) return;
    await this.prisma.refreshToken.updateMany({
      where: { id: parsed.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: number): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) throw new UnauthorizedException();
    return toPublicUser(user);
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwt.signAsync(payload);

    const id = randomUUID();
    const secret = randomBytes(32).toString('base64url');
    const refreshExpiresAt = new Date(Date.now() + this.refreshTtlMs);
    await this.prisma.refreshToken.create({
      data: {
        id,
        userId: user.id,
        tokenHash: sha256(secret).toString('hex'),
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: `${id}.${secret}`,
      refreshExpiresAt,
      user: toPublicUser(user),
    };
  }

  private parseRefreshToken(raw: string | undefined) {
    const [id, secret] = raw?.split('.') ?? [];
    return id && secret ? { id, secret } : null;
  }
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
