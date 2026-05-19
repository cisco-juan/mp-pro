import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  disconnectPrisma,
  getPrismaClient,
  type PrismaClient,
} from '@org/database';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient = getPrismaClient();

  async onModuleDestroy(): Promise<void> {
    await disconnectPrisma();
  }
}
