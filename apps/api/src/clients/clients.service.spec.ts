import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClientsService', () => {
  let service: ClientsService;
  const prisma = {
    client: {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      vehicle: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClientsService);
    jest.clearAllMocks();
  });

  it('lanza NotFoundException si el cliente no existe', async () => {
    prisma.client.client.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el email ya existe', async () => {
    prisma.client.client.findUnique.mockResolvedValue({ id: 'c1' });

    await expect(
      service.create({
        nombre: 'Test',
        email: 'test@test.com',
        telefono: '+34 600 000 000',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
