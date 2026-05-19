import {
  Calendar,
  Car,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
  UserCog,
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
  { title: 'Mantenimiento', href: '/mantenimiento', icon: Wrench },
  { title: 'Staff', href: '/staff', icon: UserCog },
  { title: 'Configuración', href: '/configuracion', icon: Settings },
];
