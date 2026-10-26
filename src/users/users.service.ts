import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '../generated/prisma/client.js';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.name,
          role: dto.role ?? Role.ADMIN,
          passwordHash: await bcrypt.hash(dto.password, 10),
        },
        select: userSelect,
      });
    } catch (error) {
      throw this.mapUniqueError(error);
    }
  }

  async update(actorId: number, id: number, dto: UpdateUserDto) {
    await this.ensureExists(id);
    if (actorId === id && (dto.isActive === false || dto.role === Role.ADMIN)) {
      throw new BadRequestException(
        'Tidak bisa menonaktifkan atau menurunkan role akun sendiri',
      );
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email?.toLowerCase(),
          name: dto.name,
          role: dto.role,
          isActive: dto.isActive,
          passwordHash: dto.password
            ? await bcrypt.hash(dto.password, 10)
            : undefined,
        },
        select: userSelect,
      });
      // Force re-login when access is reduced or credentials change.
      if (dto.password || dto.isActive === false || dto.role) {
        await this.auth.revokeAllForUser(id);
      }
      return user;
    } catch (error) {
      throw this.mapUniqueError(error);
    }
  }

  async remove(actorId: number, id: number) {
    if (actorId === id) {
      throw new BadRequestException('Tidak bisa menghapus akun sendiri');
    }
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.user.count({ where: { id } });
    if (!exists) throw new NotFoundException('User tidak ditemukan');
  }

  private mapUniqueError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Email sudah terdaftar');
    }
    return error;
  }
}
