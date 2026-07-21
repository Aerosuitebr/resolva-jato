import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  canUseToolServer,
  consumeServerUse,
  type BillableAction,
  type BillableToolId
} from '@/lib/billing-server';

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { allowed: false, accountRequired: true, error: 'Faça login para continuar.' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return NextResponse.json(
        { allowed: false, accountRequired: true, error: 'Sessão inválida.' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      toolId?: BillableToolId;
      artifactId?: string;
      action?: BillableAction;
    };

    if (!body.toolId || !body.artifactId || !body.action) {
      return NextResponse.json({ error: 'Contexto de cobrança incompleto.' }, { status: 400 });
    }

    const emailVerified = Boolean(user.emailVerifiedAt);
    const access = await canUseToolServer(user.id, emailVerified);
    if (!access.allowed) {
      return NextResponse.json(
        {
          ...access,
          charged: false
        },
        { status: 402 }
      );
    }

    const result = await consumeServerUse(user.id, {
      toolId: body.toolId,
      artifactId: body.artifactId,
      action: body.action
    });

    return NextResponse.json({
      allowed: true,
      charged: result.charged,
      usage: result.progress
    });
  } catch (error) {
    console.error('[billing/consume]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao registrar uso.' },
      { status: 500 }
    );
  }
}
