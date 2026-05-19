import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Permissions } from '../common/decorators/permissions.decorator';
import { UpdateWorkshopSettingsDto } from './dto/update-workshop-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings/workshop')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Permissions(
    'usuarios:write',
    'ordenes:write',
    'citas:write',
    'servicios:write',
    'pagos:write',
  )
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @Permissions('usuarios:write')
  update(@Body() dto: UpdateWorkshopSettingsDto) {
    return this.settingsService.update(dto);
  }
}
