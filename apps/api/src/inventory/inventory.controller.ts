import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateInventoryPartDto } from './dto/create-inventory-part.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { UpdateInventoryPartDto } from './dto/update-inventory-part.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory/parts')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Permissions('inventario:read', 'inventario:write')
  findAll(@Query('categoria') categoria?: string) {
    return this.inventoryService.findAll(categoria);
  }

  @Get(':id')
  @Permissions('inventario:read', 'inventario:write')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Permissions('inventario:write')
  create(@Body() dto: CreateInventoryPartDto) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  @Permissions('inventario:write')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryPartDto) {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/adjust-stock')
  @Permissions('inventario:write')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Post(':id/reserve')
  @Permissions('inventario:write')
  reserveStock(@Param('id') id: string, @Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(id, dto);
  }

  @Patch(':id/toggle-active')
  @Permissions('inventario:write')
  toggleActive(@Param('id') id: string) {
    return this.inventoryService.toggleActive(id);
  }
}
