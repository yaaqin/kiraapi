import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PaymentMethod } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { calculateTotals, VOUCHERS } from './pricing.js';

const transactionInclude = {
  items: true,
  cashier: { select: { id: true, name: true } },
} as const;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  getVoucher(code: string) {
    const normalized = code.trim().toUpperCase();
    const rate = VOUCHERS[normalized];
    if (rate === undefined)
      throw new NotFoundException('Kode voucher tidak valid');
    return { code: normalized, rate };
  }

  /** Prices come from the catalog, never from the client. */
  async create(cashierId: number, dto: CreateTransactionDto) {
    const ids = [...new Set(dto.items.map((i) => i.catalogItemId))];
    const catalogItems = await this.prisma.catalogItem.findMany({
      where: { id: { in: ids }, isAvailable: true },
    });
    const byId = new Map(catalogItems.map((c) => [c.id, c]));

    const lines = dto.items.map((line) => {
      const item = byId.get(line.catalogItemId);
      if (!item) {
        throw new BadRequestException(
          `Item #${line.catalogItemId} tidak tersedia`,
        );
      }
      return {
        catalogItemId: item.id,
        name: item.name,
        price: item.price,
        qty: line.qty,
      };
    });

    const voucher = dto.voucherCode ? this.getVoucher(dto.voucherCode) : null;
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const totals = calculateTotals(subtotal, voucher?.rate ?? 0);

    const isCash = dto.paymentMethod === PaymentMethod.CASH;
    if (isCash && (dto.cashReceived ?? 0) < totals.total) {
      throw new BadRequestException('Uang diterima kurang dari total');
    }

    return this.prisma.transaction.create({
      data: {
        ...totals,
        code: this.generateCode(),
        voucherCode: voucher?.code,
        paymentMethod: dto.paymentMethod,
        cashReceived: isCash ? dto.cashReceived : null,
        cashierId,
        items: { create: lines },
      },
      include: transactionInclude,
    });
  }

  findAll(limit: number) {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: transactionInclude,
    });
  }

  async summary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = { createdAt: { gte: startOfDay } };

    const [totals, byMethod, topItems] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: today,
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: today,
        _count: true,
      }),
      this.prisma.transactionItem.groupBy({
        by: ['name'],
        where: { transaction: today },
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 1,
      }),
    ]);

    const paymentBreakdown = Object.fromEntries(
      Object.values(PaymentMethod).map((m) => [
        m,
        byMethod.find((b) => b.paymentMethod === m)?._count ?? 0,
      ]),
    ) as Record<PaymentMethod, number>;

    return {
      revenue: totals._sum.total ?? 0,
      orders: totals._count,
      topItem: topItems[0]?.name ?? null,
      paymentBreakdown,
    };
  }

  private generateCode() {
    const d = new Date();
    const ymd = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `SOM-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }
}
