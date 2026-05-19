import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VehiclesService', () => {
  let service: VehiclesService;
  const prisma = {
    client: {
      client: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      vehicle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(VehiclesService);
    jest.clearAllMocks();
  });

  it('lanza NotFoundException si el vehículo no existe', async () => {
    prisma.client.vehicle.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si la matrícula ya existe', async () => {
    prisma.client.vehicle.findUnique.mockResolvedValue({ id: 'v1' });
    prisma.client.client.findUnique.mockResolvedValue({ id: 'c1' });

    await expect(
      service.create({
        clientId: 'c1',
        matricula: '1234 ABC',
        marca: 'Ford',
        modelo: 'Transit',
        anio: 2020,
        proximoMantenimiento: '2026-06-01',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
