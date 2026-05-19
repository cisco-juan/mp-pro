'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { navItems } from './nav-items';

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
          MP
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">MP Pro</p>
            <p className="truncate text-xs text-muted-foreground">Panel de taller</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed && 'px-0')}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span className="ml-2">Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
