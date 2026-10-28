import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PaymentMethod } from '../../generated/prisma/client.js';

export class CreateExpenseDto {
  @IsString()
  @MinLength(2)
  description: string;

  @IsInt()
  @Min(1)
  amount: number;

  /** Account the money is paid from; petty cash always comes out of CASH. */
  @IsOptional()
  @IsEnum(PaymentMethod)
  account?: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  isPettyCash?: boolean;

  @IsOptional()
  @IsString()
  pic?: string;
}
