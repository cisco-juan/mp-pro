'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { citasPorDia } from '@/lib/mock-data';

export function AppointmentsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas esta semana</CardTitle>
        <CardDescription>Resumen de citas programadas por día</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={citasPorDia} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="citas" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
