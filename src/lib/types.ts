import type { LucideIcon } from 'lucide-react';

export type Status = 'aprovada' | 'rascunho' | 'em_analise' | 'cancelada';

export interface Proposta {
  id: string;
  numero: string;
  cliente: string;
  produto: string;
  valor: number;
  data: string;
  status: Status;
  osNumero?: string;
}

export interface OrdemServico {
  id: string;
  numero: string;
  cliente: string;
  aeronave: string;
  tipo: string;
  dataEntrada: string;
  previsao: string;
  status: Status;
}

export interface KpiData {
  label: string;
  value: string;
  icon: string;
  trend?: { value: string; positive: boolean };
}

export interface AtividadeRecente {
  id: string;
  texto: string;
  tempo: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface MenuSection {
  id: string;
  title: string;
  icon: LucideIcon;
  accentColor: string;
  items: MenuItem[];
}

export interface StatusOption {
  label: string;
  value: 'todos' | Status;
}
