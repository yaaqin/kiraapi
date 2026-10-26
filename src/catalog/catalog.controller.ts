import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/auth.decorators.js';
import { CatalogService } from './catalog.service.js';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto.js';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** Public menu for the landing page: available items only. */
  @Public()
  @Get()
  findPublic() {
    return this.catalog.findAll(true);
  }

  /** Full list, including disabled items, for the admin catalog manager. */
  @Get('all')
  findAll() {
    return this.catalog.findAll(false);
  }

  @Post()
  create(@Body() dto: CreateCatalogItemDto) {
    return this.catalog.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.catalog.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.remove(id);
  }
}
