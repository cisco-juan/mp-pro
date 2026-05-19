import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  const prisma = {
    client: {
      workOrder: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      workOrderChecklistItem: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
      },
      workOrderPart: {
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
      client: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
      user: { findUnique: jest.fn(), update: jest.fn() },
      inventoryPart: { findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(),
    },
  };

  const sampleOrder = {
    id: 'o1',
    numero: 'OT-2026-0001',
    tipo: 'reparacion',
    clientId: 'c1',
    vehicleId: 'v1',
    assignedUserId: 'u1',
    estado: 'pendiente',
    descripcion: 'Test',
    fechaEntrada: new Date('2026-05-18'),
    fechaEstimada: new Date('2026-05-20'),
    totalEstimado: 0,
    ordenComercialId: null,
    partsUsed: [],
    checklist: [{ id: 'cl1', orden: 0, item: 'Diag', completado: false }],
    timeline: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(WorkOrdersService);
    jest.clearAllMocks();
    prisma.client.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
      fn(prisma.client),
    );
  });

  it('lanza NotFoundException si la orden no existe', async () => {
    prisma.client.workOrder.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('lanza BadRequestException si el vehículo no pertenece al cliente', async () => {
    prisma.client.client.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.client.vehicle.findUnique.mockResolvedValue({ id: 'v1', clientId: 'c2' });
    prisma.client.user.findUnique.mockResolvedValue({ id: 'u1', activo: true });

    await expect(
      service.create({
        clienteId: 'c1',
        vehiculoId: 'v1',
        usuarioId: 'u1',
        tipo: 'reparacion',
        descripcion: 'Test',
        fechaEntrada: '2026-05-18',
        fechaEstimada: '2026-05-20',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('toggleChecklistItem lanza BadRequestException con índice inválido', async () => {
    prisma.client.workOrder.findUnique.mockResolvedValue({
      ...sampleOrder,
      checklist: [],
    });

    await expect(service.toggleChecklistItem('o1', 0)).rejects.toThrow(BadRequestException);
  });
});
