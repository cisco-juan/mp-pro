'use client';

import { Fragment } from 'react';
import { Search } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/lib/auth/auth-store';

export interface HeaderBreadcrumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  breadcrumbs?: HeaderBreadcrumb[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const initials = user?.nombre
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'MP';

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <div className="relative z-20 shrink-0">
        <MobileNav />
      </div>

      {breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden min-w-0 sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="ml-auto flex max-w-sm flex-1 items-center gap-3 md:flex-initial">
        <div className="relative hidden w-full md:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes, matrículas..."
            className="h-10 pl-9"
            aria-label="Buscar"
          />
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted"
          title="Cerrar sesión"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium">{user?.nombre ?? 'Usuario'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ''}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
