# MP Pro

Sistema de gestión para talleres de vehículos (mantenimientos, reparaciones, inventarios). Monorepo Nx con aplicaciones web, API y móvil.

## Requisitos

- Node.js 20+
- Docker (para PostgreSQL local)
- npm

## Estructura del workspace

```
apps/
  api/          # NestJS — backend REST
  dashboard/    # Next.js — panel web
  app/          # Expo — app móvil
libs/
  ui-shared/    # Componentes React DOM (solo web, fase 1)
  utils-shared/ # Utilidades compartidas
  database/     # Prisma + cliente PostgreSQL
```

## Configuración inicial

1. Instalar dependencias:

```bash
npm install
```

2. Variables de entorno:

```bash
cp .env.example .env
cp libs/database/.env.example libs/database/.env  # o enlazar con la misma DATABASE_URL
```

3. Base de datos:

```bash
npm run db:up
npm run db:migrate
```

4. Sincronizar referencias TypeScript:

```bash
npx nx sync --yes
```

## Comandos de desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev:api` | API NestJS en http://localhost:3000/api |
| `npm run dev:dashboard` | Dashboard Next.js |
| `npm run dev:app` | App Expo (Metro) |
| `npm run db:up` | Levantar PostgreSQL (Docker) |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run verify` | lint + typecheck + build de proyectos principales |

### Health check API

Con la API en marcha:

```bash
curl http://localhost:3000/api/health
```

## Proyectos Nx

```bash
npx nx show projects
npx nx graph
```

### Tags y límites de módulos

- `type:app` / `scope:web|api|mobile`
- `type:ui` / `type:util` / `type:data-access`
- El dashboard **no** importa `@org/database` directamente (solo vía HTTP a la API).

## Alcance fase 1

- Estructura del monorepo y configuración base
- Prisma + PostgreSQL con modelo placeholder `HealthCheck`
- Sin dominio de negocio (vehículos, órdenes, inventario)
- `ui-shared` solo para web; la app móvil usa `utils-shared` únicamente

## Tecnologías

- [Nx](https://nx.dev) 22
- NestJS, Next.js 16, Expo 54
- Prisma 7 + PostgreSQL 16
- TypeScript 5.9
