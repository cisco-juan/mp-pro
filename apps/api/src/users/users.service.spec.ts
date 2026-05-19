import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    client: {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('lanza NotFoundException si el usuario no existe', async () => {
    prisma.client.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si el email ya existe', async () => {
    prisma.client.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(
      service.create({
        nombre: 'Test',
        email: 'test@test.com',
        rolId: 'r1',
        password: 'Password1!',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
