import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('export/csv')
  @Permissions('clientes:read', 'clientes:write')
  async exportCsv(@Res() res: Response) {
    const csv = await this.clientsService.exportCsv();
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clientes.csv"',
    });
    res.send(csv);
  }

  @Get()
  @Permissions('clientes:read', 'clientes:write')
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Permissions('clientes:read', 'clientes:write')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Permissions('clientes:write')
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @Permissions('clientes:write')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Permissions('clientes:write')
  toggleActive(@Param('id') id: string) {
    return this.clientsService.toggleActive(id);
  }
}
