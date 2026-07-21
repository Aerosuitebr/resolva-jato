import { getUsageState, type BillableToolId } from '@/lib/billing';

export interface ToolsEngagement {
  docsThisMonth: number;
  totalDocs: number;
  badges: Array<{ id: string; label: string; unlocked: boolean }>;
}

function isSameMonth(iso: string, now = new Date()) {
  const date = new Date(iso);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function getToolsEngagement(): ToolsEngagement {
  const state = getUsageState();
  const docsThisMonth = state.recentActions.filter((entry) => isSameMonth(entry.occurredAt)).length;
  const toolsUsed = new Set(state.recentActions.map((entry) => entry.toolId));

  const badges = [
    {
      id: 'first-doc',
      label: 'Primeiro documento',
      unlocked: state.totalConsumed >= 1
    },
    {
      id: 'first-contract',
      label: 'Primeiro contrato',
      unlocked: toolsUsed.has('contratos' as BillableToolId)
    },
    {
      id: 'recibos-pro',
      label: 'Recibos em dia',
      unlocked: state.recentActions.filter((e) => e.toolId === 'recibos').length >= 3
    },
    {
      id: 'ten-docs',
      label: '10 documentos',
      unlocked: state.totalConsumed >= 10
    }
  ];

  return {
    docsThisMonth,
    totalDocs: state.totalConsumed,
    badges
  };
}
