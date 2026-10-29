import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Category } from '../../generated/prisma/client.js';

export class CreateCatalogItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(Category)
  category: Category;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsOptional()
  @IsUrl()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string | null;

  /** Retail grouping shown as a filter on the landing page (e.g. "Shampoo"). */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  subcategory?: string | null;

  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
