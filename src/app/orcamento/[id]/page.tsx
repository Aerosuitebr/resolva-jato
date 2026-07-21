import { OrcamentoPublicView } from '@/components/orcamentos/orcamento-public-view';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import type { OrcamentoItem, OrcamentoPublic } from '@/lib/orcamentos/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

async function loadOrcamento(id: string): Promise<OrcamentoPublic | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const prisma = getPrisma();
    const row = await prisma.orcamento.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      profissionalNome: row.profissionalNome,
      profissionalWhatsapp: row.profissionalWhatsapp,
      clienteNome: row.clienteNome,
      clienteContato: row.clienteContato,
      clienteEmail: row.clienteEmail || '',
      itens: row.itens as unknown as OrcamentoItem[],
      total: row.total,
      validade: row.validade,
      observacoes: row.observacoes,
      status: row.status,
      feedbackCliente: row.feedbackCliente,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  } catch {
    return null;
  }
}

export default async function OrcamentoPublicPage({ params }: PageProps) {
  const orcamento = await loadOrcamento(params.id);

  if (!orcamento) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Orçamento indisponível</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Não encontramos este orçamento. Confira o link ou peça um novo ao profissional.
            Se o banco ainda não estiver configurado neste ambiente, o link público não estará ativo.
          </p>
        </div>
      </div>
    );
  }

  return <OrcamentoPublicView initial={orcamento} />;
}
