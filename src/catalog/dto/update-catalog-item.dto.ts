import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogItemDto } from './create-catalog-item.dto.js';

export class UpdateCatalogItemDto extends PartialType(CreateCatalogItemDto) {}
