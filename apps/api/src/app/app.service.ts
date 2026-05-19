import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@org/utils-shared';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: `Bienvenido a ${APP_NAME} API` };
  }
}
