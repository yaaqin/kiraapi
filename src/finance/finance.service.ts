import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';

export enum ReportRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

/** Max rows per source in the ledger; the totals are always exact. */
const LEDGER_LIMIT = 500;
const TREND_DAYS = 7;

type LedgerKind = 'SALE' | 'EXPENSE' | 'PETTY_CASH';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  createExpense(createdById: number, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        description: dto.description.trim(),
        amount: dto.amount,
        account: dto.isPettyCash
          ? PaymentMethod.CASH
          : (dto.account ?? PaymentMethod.CASH),
        isPettyCash: dto.isPettyCash ?? false,
        pic: dto.pic?.trim() || null,
        createdById,
      },
    });
  }

  async removeExpense(id: number) {
    try {
      await this.prisma.expense.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Biaya tidak ditemukan');
      }
      throw error;
    }
  }

  async report(range: ReportRange) {
    const start = rangeStart(range);
    const inRange = start ? { createdAt: { gte: start } } : {};

    const [
      salesByMethod,
      expensesByAccount,
      periodSales,
      periodExpenses,
      transactions,
      expenses,
      trend,
    ] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['paymentMethod'],
        _sum: { total: true },
      }),
      this.prisma.expense.groupBy({
        by: ['account'],
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: inRange,
        _sum: { total: true },
      }),
      this.prisma.expense.groupBy({
        by: ['isPettyCash'],
        where: inRange,
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: inRange,
        orderBy: { createdAt: 'desc' },
        take: LEDGER_LIMIT,
        include: { items: { select: { name: true, qty: true } } },
      }),
      this.prisma.expense.findMany({
        where: inRange,
        orderBy: { createdAt: 'desc' },
        take: LEDGER_LIMIT,
        include: { createdBy: { select: { name: true } } },
      }),
      this.trend(),
    ]);

    const byMethod = <T>(
      rows: T[],
      key: (row: T) => PaymentMethod,
      sum: (row: T) => number | null,
    ) =>
      Object.fromEntries(
        Object.values(PaymentMethod).map((m) => {
          const row = rows.find((r) => key(r) === m);
          return [m, row ? (sum(row) ?? 0) : 0];
        }),
      ) as Record<PaymentMethod, number>;

    const salesTotals = byMethod(
      salesByMethod,
      (r) => r.paymentMethod,
      (r) => r._sum.total,
    );
    const expenseTotals = byMethod(
      expensesByAccount,
      (r) => r.account,
      (r) => r._sum.amount,
    );
    const revenueByMethod = byMethod(
      periodSales,
      (r) => r.paymentMethod,
      (r) => r._sum.total,
    );
    const expenseSum = (petty: boolean) =>
      periodExpenses.find((r) => r.isPettyCash === petty)?._sum.amount ?? 0;

    const ledger = [
      ...transactions.map((t) => ({
        kind: 'SALE' as LedgerKind,
        id: t.id,
        ref: t.code,
        date: t.createdAt,
        description: t.items.map((i) => `${i.name} (x${i.qty})`).join(', '),
        account: t.paymentMethod,
        debit: t.total,
        credit: 0,
        pic: null,
      })),
      ...expenses.map((e) => ({
        kind: (e.isPettyCash ? 'PETTY_CASH' : 'EXPENSE') as LedgerKind,
        id: e.id,
        ref: `EXP-${String(e.id).padStart(5, '0')}`,
        date: e.createdAt,
        description: e.description,
        account: e.account,
        debit: 0,
        credit: e.amount,
        pic: e.pic ?? e.createdBy?.name ?? null,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      range,
      /** All-time balance per cash account, independent of the range. */
      balances: Object.fromEntries(
        Object.values(PaymentMethod).map((m) => [
          m,
          salesTotals[m] - expenseTotals[m],
        ]),
      ) as Record<PaymentMethod, number>,
      period: {
        revenue: Object.values(revenueByMethod).reduce((a, b) => a + b, 0),
        revenueByMethod,
        expenses: expenseSum(false),
        pettyCash: expenseSum(true),
      },
      ledger,
      trend,
    };
  }

  /** Revenue and spending per day for the last TREND_DAYS days. */
  private async trend() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (TREND_DAYS - 1));
    const since = { createdAt: { gte: start } };

    const [transactions, expenses] = await Promise.all([
      this.prisma.transaction.findMany({
        where: since,
        select: { createdAt: true, total: true },
      }),
      this.prisma.expense.findMany({
        where: since,
        select: { createdAt: true, amount: true },
      }),
    ]);

    const days = Array.from({ length: TREND_DAYS }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: dayKey(d), revenue: 0, expenses: 0 };
    });
    const byDay = new Map(days.map((d) => [d.date, d]));
    for (const t of transactions)
      byDay.get(dayKey(t.createdAt))!.revenue += t.total;
    for (const e of expenses)
      byDay.get(dayKey(e.createdAt))!.expenses += e.amount;
    return days;
  }
}

function rangeStart(range: ReportRange): Date | null {
  if (range === ReportRange.ALL) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Weeks start on Monday.
  if (range === ReportRange.WEEK)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (range === ReportRange.MONTH) d.setDate(1);
  return d;
}

/** Local calendar day as YYYY-MM-DD, matching the server's day boundaries. */
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
