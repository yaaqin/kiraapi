import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto.js';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto.js';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(onlyAvailable: boolean) {
    return this.prisma.catalogItem.findMany({
      where: onlyAvailable ? { isAvailable: true } : undefined,
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    });
  }

  create(dto: CreateCatalogItemDto) {
    return this.prisma.catalogItem.create({ data: dto });
  }

  async update(id: number, dto: UpdateCatalogItemDto) {
    try {
      return await this.prisma.catalogItem.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.mapNotFound(error);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.catalogItem.delete({ where: { id } });
    } catch (error) {
      throw this.mapNotFound(error);
    }
  }

  private mapNotFound(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return new NotFoundException('Item tidak ditemukan');
    }
    return error;
  }
}
