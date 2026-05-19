import {
  Calendar,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Clientes', href: '/clientes', icon: Users },
  { title: 'Vehículos', href: '/vehiculos', icon: Car },
  { title: 'Citas', href: '/citas', icon: Calendar },
  { title: 'Taller', href: '/taller', icon: Wrench },
  { title: 'Inventario', href: '/inventario', icon: Package },
  { title: 'Servicios', href: '/servicios', icon: ClipboardList },
  { title: 'Órdenes', href: '/ordenes', icon: FileText },
  { title: 'Pagos', href: '/pagos', icon: CreditCard },
  { title: 'Usuarios', href: '/usuarios', icon: Shield },
  { title: 'Configuración', href: '/configuracion', icon: Settings },
];
