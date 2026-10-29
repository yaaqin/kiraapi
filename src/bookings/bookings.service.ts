import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ preferredDate: 'desc' }, { createdAt: 'desc' }],
      take: 300,
    });
  }

  async create(dto: CreateBookingDto) {
    const date = new Date(`${dto.preferredDate}T00:00:00Z`);
    const today = new Date(new Date().toISOString().slice(0, 10));
    if (date < today) {
      throw new BadRequestException('Tanggal booking sudah lewat');
    }

    // Prices come from the catalog, never from the client.
    const lines = dto.items ?? [];
    const catalog = lines.length
      ? await this.prisma.catalogItem.findMany({
          where: {
            id: { in: lines.map((l) => l.catalogItemId) },
            isAvailable: true,
          },
        })
      : [];
    const items = lines.flatMap((line) => {
      const item = catalog.find((c) => c.id === line.catalogItemId);
      return item
        ? [{ name: item.name, price: item.price, qty: line.qty }]
        : [];
    });

    const booking = await this.prisma.booking.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        preferredDate: date,
        preferredTime: dto.preferredTime.replace(':', '.'),
        note: dto.note?.trim() || null,
        items,
        total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      },
    });
    return { id: booking.id };
  }

  async updateStatus(id: number, status: BookingStatus) {
    try {
      return await this.prisma.booking.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Booking tidak ditemukan');
      }
      throw error;
    }
  }
}
