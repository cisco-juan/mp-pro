import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { mapUserToResponse } from '../common/mappers/user.mapper';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ReturnType<typeof mapUserToResponse>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.client.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { role: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (!stored.user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    await this.prisma.client.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string | undefined, userId: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.client.refreshToken.deleteMany({
        where: { tokenHash, userId },
      });
      return;
    }

    await this.prisma.client.refreshToken.deleteMany({ where: { userId } });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return mapUserToResponse(user);
  }

  private async issueTokens(
    user: {
      id: string;
      email: string;
      roleId: string;
      activo: boolean;
      nombre: string;
      telefono: string | null;
      ordenesActivas: number;
      role: { id: string; nombre: string; descripcion: string; permisos: string[] };
    },
  ): Promise<AuthTokensResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      permisos: user.role.permisos,
    };

    const expiresIn = this.parseExpiresIn(
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    );

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn,
    });

    const refreshToken = randomBytes(32).toString('hex');
    const refreshDays = Number(
      this.config.get<string>('JWT_REFRESH_EXPIRES_DAYS', '7'),
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.prisma.client.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: mapUserToResponse(user as Parameters<typeof mapUserToResponse>[0]),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiresIn(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 900;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return amount * (multipliers[unit] ?? 60);
  }
}
