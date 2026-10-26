import type { Role } from '../generated/prisma/client.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}
