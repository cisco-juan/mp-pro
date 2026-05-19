'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Introduce email y contraseña.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    router.push('/');
  }

  return (
    <div className="flex min-h-dvh">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 font-mono text-lg font-bold">
            MP
          </div>
          <div>
            <p className="text-xl font-semibold">MP Pro</p>
            <p className="text-sm text-primary-foreground/80">Gestión de talleres</p>
          </div>
        </div>
        <div className="max-w-md">
          <Wrench className="mb-6 size-12 opacity-80" aria-hidden />
          <h2 className="text-3xl font-semibold leading-tight">
            Control total de tu taller en un solo lugar
          </h2>
          <p className="mt-4 text-primary-foreground/85">
            Clientes, vehículos, citas y órdenes de mantenimiento organizados para
            que tu equipo trabaje con más fluidez.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 MP Pro</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center lg:text-left">
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Accede al panel de administración de tu taller
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@taller.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="cursor-pointer font-normal">
                    Recordarme
                  </Label>
                </div>
                <Link
                  href="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="min-h-11 w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
