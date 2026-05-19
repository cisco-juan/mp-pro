import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../common/types/auth-user.type';

export type JwtPayload = {
  sub: string;
  email: string;
  roleId: string;
  permisos: string[];
  iat?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    if (user.passwordChangedAt && payload.iat) {
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (tokenIssuedAt < user.passwordChangedAt) {
        throw new UnauthorizedException('Sesión invalidada');
      }
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      roleId: user.roleId,
      permisos: user.role.permisos,
      activo: user.activo,
    };
  }
}
