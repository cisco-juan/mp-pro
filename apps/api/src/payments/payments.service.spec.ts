import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const prisma = {
    client: {
      payment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
      commercialOrder: { findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PaymentsService);
    jest.clearAllMocks();
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    prisma.client.payment.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
