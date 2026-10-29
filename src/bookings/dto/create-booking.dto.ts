import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BookingLineDto {
  @IsInt()
  catalogItemId: number;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateBookingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Matches(/^\+?[0-9\s-]{8,20}$/, { message: 'Nomor WhatsApp tidak valid' })
  phone: string;

  /** YYYY-MM-DD */
  @IsDateString({ strict: true })
  preferredDate: string;

  @Matches(/^\d{2}[.:]\d{2}$/, { message: 'Waktu tidak valid' })
  preferredTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BookingLineDto)
  items?: BookingLineDto[];
}
