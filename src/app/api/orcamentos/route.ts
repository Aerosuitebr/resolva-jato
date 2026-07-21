import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { validateOrcamentoPayload } from '@/lib/orcamentos/schema';
import type { OrcamentoItem } from '@/lib/orcamentos/types';

function appBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Banco não configurado. Defina DATABASE_URL no .env (veja .env.example) e rode npx prisma db push.'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = validateOrcamentoPayload(body);
    if (!validated.ok || !validated.data) {
      return NextResponse.json({ error: validated.error || 'Dados inválidos.' }, { status: 400 });
    }

    const prisma = getPrisma();
    const created = await prisma.orcamento.create({
      data: {
        profissionalNome: validated.data.profissionalNome,
        profissionalWhatsapp: validated.data.profissionalWhatsapp,
        clienteNome: validated.data.clienteNome,
        clienteContato: validated.data.clienteContato || '',
        clienteEmail: validated.data.clienteEmail || '',
        itens: validated.data.itens as unknown as Prisma.InputJsonValue,
        total: validated.data.total,
        validade: validated.data.validade || '',
        observacoes: validated.data.observacoes || '',
        ownerEmail: validated.data.ownerEmail || null
      }
    });

    const url = `${appBaseUrl(request)}/orcamento/${created.id}`;
    return NextResponse.json({
      id: created.id,
      url,
      total: created.total,
      status: created.status,
      whatsapp: {
        sent: false,
        configured: true,
        mode: 'ephemeral',
        error: null
      }
    });
  } catch (error) {
    console.error('[POST /api/orcamentos]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível salvar o orçamento.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get('ownerEmail')?.trim().toLowerCase();
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Informe ownerEmail para listar orçamentos.' }, { status: 400 });
    }

    const prisma = getPrisma();
    const rows = await prisma.orcamento.findMany({
      where: { ownerEmail },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const base = appBaseUrl(request);
    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        url: `${base}/orcamento/${row.id}`,
        clienteNome: row.clienteNome,
        clienteContato: row.clienteContato,
        clienteEmail: row.clienteEmail,
        profissionalNome: row.profissionalNome,
        profissionalWhatsapp: row.profissionalWhatsapp,
        validade: row.validade,
        observacoes: row.observacoes,
        itens: row.itens as unknown as OrcamentoItem[],
        total: row.total,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('[GET /api/orcamentos]', error);
    return NextResponse.json({ error: 'Não foi possível listar orçamentos.' }, { status: 500 });
  }
}
