import { CreditCard, FileText, Search, Sparkles } from 'lucide-react';
import { searchCategories } from './search-catalog';
import { toolsCatalog } from './tools-catalog';
import type { MenuSection } from './types';

export const menuSections: MenuSection[] = [
  {
    id: 'ferramentas',
    title: 'FERRAMENTAS',
    icon: Sparkles,
    accentColor: '#38bdf8',
    items: [
      { id: 'hub-ferramentas', label: 'Minhas ferramentas', href: '/ferramentas', icon: Sparkles },
      ...toolsCatalog.map((tool) => ({
        id: tool.id,
        label: tool.name,
        href: tool.href,
        icon: tool.icon
      }))
    ]
  },
  {
    id: 'busca',
    title: 'BUSCA GRATUITA',
    icon: Search,
    accentColor: '#a78bfa',
    items: searchCategories.map((category) => ({
      id: `busca-${category.id}`,
      label: category.label,
      href: category.requiresAuth
        ? category.href || '/ferramentas'
        : category.id === 'todos'
          ? '/busca'
          : `/busca?categoria=${category.id}`,
      icon: category.icon
    }))
  },
  {
    id: 'conta',
    title: 'CONTA',
    icon: CreditCard,
    accentColor: '#fbbf24',
    items: [
      { id: 'minha-conta', label: 'Plano e utilizações', href: '/conta', icon: CreditCard },
      { id: 'planos', label: 'Ver planos', href: '/planos', icon: FileText },
      { id: 'busca-livre', label: 'Página inicial', href: '/', icon: Search }
    ]
  }
];
