import { Fira_Code, Fira_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth/auth-store';
import './global.css';

const firaSans = Fira_Sans({
  subsets: ['latin'],
  variable: '--font-fira-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: {
    default: 'MP Pro — Panel de taller',
    template: '%s | MP Pro',
  },
  description: 'Sistema de gestión para talleres de vehículos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="min-h-dvh font-sans">
        <TooltipProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
