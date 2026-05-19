import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  const prisma = {
    client: {
      inventoryPart: {
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
      providers: [InventoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(InventoryService);
    jest.clearAllMocks();
  });

  it('lanza NotFoundException si la pieza no existe', async () => {
    prisma.client.inventoryPart.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el código ya existe', async () => {
    prisma.client.inventoryPart.findUnique.mockResolvedValue({ id: 'p1' });

    await expect(
      service.create({
        codigo: 'FLT-OIL-001',
        nombre: 'Filtro',
        categoria: 'Filtros',
        precioUnitario: 10,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('lanza BadRequestException si el ajuste deja stock negativo', async () => {
    prisma.client.inventoryPart.findUnique.mockResolvedValue({
      id: 'p1',
      stock: 2,
    });

    await expect(service.adjustStock('p1', { delta: -5 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lanza BadRequestException si no hay stock suficiente para reservar', async () => {
    prisma.client.inventoryPart.findUnique.mockResolvedValue({
      id: 'p1',
      stock: 1,
    });

    await expect(service.reserveStock('p1', { cantidad: 3 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('reserva stock correctamente', async () => {
    prisma.client.inventoryPart.findUnique.mockResolvedValue({
      id: 'p1',
      codigo: 'FLT-OIL-001',
      nombre: 'Filtro',
      categoria: 'Filtros',
      stock: 5,
      stockMinimo: 2,
      precioUnitario: 12.5,
      ubicacion: 'A-01',
      estado: 'activo',
    });
    prisma.client.inventoryPart.update.mockResolvedValue({
      id: 'p1',
      codigo: 'FLT-OIL-001',
      nombre: 'Filtro',
      categoria: 'Filtros',
      stock: 3,
      stockMinimo: 2,
      precioUnitario: 12.5,
      ubicacion: 'A-01',
      estado: 'activo',
    });

    const result = await service.reserveStock('p1', { cantidad: 2 });

    expect(result.stock).toBe(3);
    expect(prisma.client.inventoryPart.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stock: 3 },
    });
  });
});
