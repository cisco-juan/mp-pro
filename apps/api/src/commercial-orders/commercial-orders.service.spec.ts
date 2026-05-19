import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CommercialOrdersService } from './commercial-orders.service';

describe('CommercialOrdersService', () => {
  let service: CommercialOrdersService;
  const prisma = {
    client: {
      commercialOrder: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      workshopSettings: { findUnique: jest.fn() },
      client: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
      workOrder: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      inventoryPart: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommercialOrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CommercialOrdersService);
    jest.clearAllMocks();
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    prisma.client.commercialOrder.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
