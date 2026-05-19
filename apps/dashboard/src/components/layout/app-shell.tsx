'use client';

import { AppHeader, type HeaderBreadcrumb } from './app-header';
import { AppSidebar } from './app-sidebar';
import { PageTransition } from './page-transition';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: HeaderBreadcrumb[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
