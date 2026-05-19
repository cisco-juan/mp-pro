import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    client: {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('access-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const values: Record<string, string> = {
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_DAYS: '7',
              };
              return values[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('rechaza credenciales inválidas', async () => {
    prisma.client.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('inicia sesión con credenciales válidas', async () => {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    prisma.client.user.findUnique.mockResolvedValue({
      id: 'u8',
      email: 'admin@mppro.local',
      nombre: 'Admin',
      telefono: null,
      roleId: 'r1',
      activo: true,
      ordenesActivas: 0,
      passwordHash,
      role: {
        id: 'r1',
        nombre: 'Administrador',
        descripcion: '',
        permisos: ['usuarios:write'],
      },
    });
    prisma.client.refreshToken.create.mockResolvedValue({});

    const result = await service.login({
      email: 'admin@mppro.local',
      password: 'Admin123!',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('admin@mppro.local');
  });
});
