import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('usuarios:write')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions('usuarios:write')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }
}
