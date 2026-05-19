import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const prisma = {
    client: {
      workshopSettings: { findUnique: jest.fn(), update: jest.fn() },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SettingsService);
    jest.clearAllMocks();
  });

  it('get lanza NotFoundException si no hay configuración', async () => {
    prisma.client.workshopSettings.findUnique.mockResolvedValue(null);
    await expect(service.get()).rejects.toBeInstanceOf(NotFoundException);
  });
});
