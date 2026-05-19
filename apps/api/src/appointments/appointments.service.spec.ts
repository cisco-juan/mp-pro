import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  const prisma = {
    client: {
      appointment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      client: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
      serviceCatalog: { findUnique: jest.fn() },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AppointmentsService);
    jest.clearAllMocks();
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    prisma.client.appointment.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
