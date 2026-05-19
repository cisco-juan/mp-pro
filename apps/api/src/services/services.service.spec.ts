import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;
  const prisma = {
    client: {
      serviceCatalog: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ServicesService);
    jest.clearAllMocks();
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    prisma.client.serviceCatalog.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create persiste servicio', async () => {
    prisma.client.serviceCatalog.create.mockResolvedValue({
      id: 'sv1',
      nombre: 'Test',
      descripcion: '',
      precio: 10,
      duracionMin: 60,
      categoria: 'General',
      activo: true,
    });

    const result = await service.create({
      nombre: 'Test',
      precio: 10,
      duracionMin: 60,
      categoria: 'General',
    });

    expect(result.id).toBe('sv1');
    expect(result.precio).toBe(10);
  });
});
