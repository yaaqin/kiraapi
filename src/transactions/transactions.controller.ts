import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorators.js';
import type { JwtPayload } from '../auth/auth.types.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.transactions.findAll(Math.min(limit, 500));
  }

  @Get('summary')
  summary() {
    return this.transactions.summary();
  }

  @Get('vouchers/:code')
  voucher(@Param('code') code: string) {
    return this.transactions.getVoucher(code);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransactionDto) {
    return this.transactions.create(user.sub, dto);
  }
}
