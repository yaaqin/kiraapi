import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '../generated/prisma/client.js';
import { CurrentUser, Roles } from '../auth/auth.decorators.js';
import type { JwtPayload } from '../auth/auth.types.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { FinanceService, ReportRange } from './finance.service.js';

@Roles(Role.SUPERADMIN)
@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('report')
  report(
    @Query(
      'range',
      new DefaultValuePipe('today'),
      new ParseEnumPipe(ReportRange),
    )
    range: ReportRange,
  ) {
    return this.finance.report(range);
  }

  @Post('expenses')
  createExpense(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.finance.createExpense(user.sub, dto);
  }

  @Delete('expenses/:id')
  @HttpCode(204)
  removeExpense(@Param('id', ParseIntPipe) id: number) {
    return this.finance.removeExpense(id);
  }
}
