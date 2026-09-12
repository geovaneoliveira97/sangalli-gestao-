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

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Navegação agrupada por contexto de trabalho — reflete apenas telas que
// existem de fato no sistema (nada de páginas fictícias para "completar" o menu).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Visão geral',
    items: [{ to: '/dashboard', label: 'Painel', icon: LayoutDashboard }],
  },
  {
    label: 'Operação',
    items: [
      { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
      { to: '/veiculos', label: 'Veículos', icon: Car },
      { to: '/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    label: 'Oficina',
    items: [
      { to: '/servicos', label: 'Serviços', icon: Wrench },
      { to: '/pecas', label: 'Peças', icon: Package },
    ],
  },
  {
    label: 'Financeiro',
    items: [{ to: '/financeiro', label: 'Financeiro', icon: Wallet }],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
      { to: '/usuarios', label: 'Usuários', icon: UserCog },
      { to: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
];

// Mantido para compatibilidade com quem só precisa da lista plana.
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
