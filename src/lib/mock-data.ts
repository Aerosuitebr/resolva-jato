import type { AtividadeRecente, KpiData, OrdemServico, Proposta, StatusOption } from './types';

export const statusOptions: StatusOption[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Aprovada', value: 'aprovada' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Em analise', value: 'em_analise' },
  { label: 'Cancelada', value: 'cancelada' }
];

export const propostas: Proposta[] = [
  { id: '1', numero: 'PC-2026-0042', cliente: 'Atlântico Táxi Aéreo', produto: 'Overhaul Motor PW535E', valor: 184500, data: '2026-07-14', status: 'em_analise', osNumero: 'OS-2026-1184' },
  { id: '2', numero: 'PC-2026-0041', cliente: 'Costa Verde Aviation', produto: 'Kit FCU Honeywell PN 3070800-4', valor: 52450, data: '2026-07-13', status: 'aprovada', osNumero: 'OS-2026-1181' },
  { id: '3', numero: 'PC-2026-0040', cliente: 'Rio Executive Jets', produto: 'Inspecao 600h Phenom 300', valor: 89400, data: '2026-07-12', status: 'rascunho' },
  { id: '4', numero: 'PC-2026-0039', cliente: 'Bossa Air Services', produto: 'Substituicao atuador trem de pouso', valor: 36400, data: '2026-07-11', status: 'cancelada' },
  { id: '5', numero: 'PC-2026-0038', cliente: 'Guanabara Flight Ops', produto: 'Reparo avionico Garmin G3000', valor: 72800, data: '2026-07-10', status: 'aprovada', osNumero: 'OS-2026-1175' },
  { id: '6', numero: 'PC-2026-0037', cliente: 'Santos Dumont Charter', produto: 'Troca kit freio Citation XLS+', valor: 41890, data: '2026-07-09', status: 'em_analise' },
  { id: '7', numero: 'PC-2026-0036', cliente: 'Angra Aviation Group', produto: 'Boletim tecnico winglet Legacy 650', valor: 26700, data: '2026-07-08', status: 'rascunho' },
  { id: '8', numero: 'PC-2026-0035', cliente: 'JatoSul Operacoes', produto: 'Bateria principal PN 501-1228-04', valor: 19890, data: '2026-07-07', status: 'aprovada', osNumero: 'OS-2026-1169' },
  { id: '9', numero: 'PC-2026-0034', cliente: 'Blue Hangar RJ', produto: 'Pintura tecnica radome', valor: 33400, data: '2026-07-06', status: 'em_analise' },
  { id: '10', numero: 'PC-2026-0033', cliente: 'Litoral Jets', produto: 'Check de pressurizacao cabine', valor: 22450, data: '2026-07-05', status: 'rascunho' }
];

export const ordensServico: OrdemServico[] = [
  { id: '1', numero: 'OS-2026-1184', cliente: 'Atlântico Táxi Aéreo', aeronave: 'Citation Latitude PR-ATL', tipo: 'Motor', dataEntrada: '2026-07-14', previsao: '2026-07-29', status: 'em_analise' },
  { id: '2', numero: 'OS-2026-1181', cliente: 'Costa Verde Aviation', aeronave: 'Phenom 300 PR-CVA', tipo: 'FCU', dataEntrada: '2026-07-13', previsao: '2026-07-22', status: 'aprovada' },
  { id: '3', numero: 'OS-2026-1178', cliente: 'Rio Executive Jets', aeronave: 'Legacy 500 PR-REJ', tipo: 'Inspecao', dataEntrada: '2026-07-12', previsao: '2026-07-26', status: 'rascunho' },
  { id: '4', numero: 'OS-2026-1175', cliente: 'Guanabara Flight Ops', aeronave: 'Praetor 600 PR-GFO', tipo: 'Avionico', dataEntrada: '2026-07-10', previsao: '2026-07-19', status: 'aprovada' },
  { id: '5', numero: 'OS-2026-1172', cliente: 'Santos Dumont Charter', aeronave: 'Citation XLS+ PR-SDC', tipo: 'Freios', dataEntrada: '2026-07-09', previsao: '2026-07-17', status: 'em_analise' },
  { id: '6', numero: 'OS-2026-1169', cliente: 'JatoSul Operacoes', aeronave: 'Learjet 75 PR-JSO', tipo: 'Eletrica', dataEntrada: '2026-07-07', previsao: '2026-07-15', status: 'aprovada' },
  { id: '7', numero: 'OS-2026-1166', cliente: 'Blue Hangar RJ', aeronave: 'Falcon 2000 PR-BHR', tipo: 'Estrutural', dataEntrada: '2026-07-05', previsao: '2026-07-24', status: 'cancelada' },
  { id: '8', numero: 'OS-2026-1163', cliente: 'Litoral Jets', aeronave: 'Gulfstream G280 PR-LTJ', tipo: 'Pressurizacao', dataEntrada: '2026-07-03', previsao: '2026-07-18', status: 'rascunho' }
];

export const kpis: KpiData[] = [
  { label: 'OS Abertas', value: '12', icon: 'Wrench', trend: { value: '+8%', positive: true } },
  { label: 'Propostas Pendentes', value: '5', icon: 'FileText', trend: { value: '+2', positive: true } },
  { label: 'Pecas em Quarentena', value: '3', icon: 'PackageSearch', trend: { value: '-1', positive: true } },
  { label: 'Faturamento Mes', value: 'R$ 284.500', icon: 'CircleDollarSign', trend: { value: '+14%', positive: true } }
];

export const atividadesRecentes: AtividadeRecente[] = [
  { id: '1', texto: 'OS-2026-1184 criada para overhaul do motor PW535E', tempo: 'ha 2h' },
  { id: '2', texto: 'Proposta PC-2026-0041 aprovada pela Costa Verde Aviation', tempo: 'ha 4h' },
  { id: '3', texto: 'Kit FCU Honeywell recebido e direcionado para quarentena', tempo: 'ontem' },
  { id: '4', texto: 'Capacidade do hangar 2 atualizada para a proxima semana', tempo: 'ontem' },
  { id: '5', texto: 'Fornecedor homologado para componentes Garmin G3000', tempo: '2 dias' }
];
