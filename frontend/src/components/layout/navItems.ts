import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Car,
  Wrench,
  Package,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
  { to: '/clientes', label: 'Clientes', icon: Users, roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/veiculos', label: 'Veículos', icon: Car, roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/servicos', label: 'Serviços', icon: Wrench },
  { to: '/pecas', label: 'Peças', icon: Package },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet, roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/usuarios', label: 'Usuários', icon: UserCog, roles: ['ADMIN'] },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];
