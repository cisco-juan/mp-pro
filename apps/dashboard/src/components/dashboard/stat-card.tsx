import { type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  trendPositive?: boolean;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  trendPositive = true,
}: StatCardProps) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="font-mono text-2xl font-semibold tracking-tight">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trendPositive ? 'text-accent' : 'text-destructive'
            )}
          >
            {trend} vs. semana anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
