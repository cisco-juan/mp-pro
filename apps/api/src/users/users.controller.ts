import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('usuarios:write')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions('usuarios:write')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions('usuarios:write')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Permissions('usuarios:write')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/change-password')
  @Permissions('usuarios:write')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(id, dto);
  }

  @Patch(':id/toggle-active')
  @Permissions('usuarios:write')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
