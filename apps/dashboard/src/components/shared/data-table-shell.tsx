import { cn } from '@/lib/utils';

interface DataTableShellProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DataTableShell({ children, footer, className }: DataTableShellProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-sm',
        className
      )}
    >
      {children}
      {footer}
    </div>
  );
}
