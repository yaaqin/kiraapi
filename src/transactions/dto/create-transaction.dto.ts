import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../generated/prisma/client.js';

export class TransactionLineDto {
  @IsInt()
  catalogItemId: number;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateTransactionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransactionLineDto)
  items: TransactionLineDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cashReceived?: number;
}
