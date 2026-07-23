import { NextResponse } from 'next/server';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';
import { activatePremiumFromNuPayPayment } from '@/lib/billing-server';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { onlyDigits } from '@/lib/cpf';
import {
  createNuPayPaymentFromSession,
  getNuPayPaymentStatus,
  getNuPaySession,
  getNuPaySessionByReference,
  isNuPayConfigured,
  isNuPayPaymentPaid,
  parseUserIdFromNuPayReference
} from '@/lib/nupay';

/**
 * Confirma retorno NuPay: consulta sessão, captura pagamento e libera Premium.
 */
export async function GET(request: Request) {
  try {
    if (!isNuPayConfigured()) {
      return NextResponse.json({ error: 'NuPay não configurado.' }, { status: 503 });
    }
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const auth = readSessionFromCookies();
    if (!auth) {
      return NextResponse.json({ approved: false, error: 'Faça login para confirmar.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('session_id') || '';
    const reference = searchParams.get('reference') || '';
    const state = (searchParams.get('state') || '').toLowerCase();

    if (state === 'canceled' || state === 'cancelled') {
      return NextResponse.json({
        approved: false,
        status: 'canceled',
        statusDetail: 'cancelled_by_user'
      });
    }

    let session = sessionId
      ? await getNuPaySession(sessionId)
      : reference
        ? await getNuPaySessionByReference(reference)
        : null;

    if (!session) {
      return NextResponse.json({
        approved: false,
        status: 'pending',
        statusDetail: 'sessao_nao_encontrada'
      });
    }

    const userId = parseUserIdFromNuPayReference(session.reference);
    if (!userId || userId !== auth.sub) {
      return NextResponse.json(
        { approved: false, error: 'Pagamento NuPay não corresponde a esta conta.' },
        { status: 403 }
      );
    }

    if (session.status === 'pending') {
      return NextResponse.json({
        approved: false,
        status: 'pending',
        sessionId: session.id,
        reference: session.reference
      });
    }

    if (session.status === 'canceled' || session.status === 'expired') {
      return NextResponse.json({
        approved: false,
        status: session.status,
        sessionId: session.id,
        reference: session.reference
      });
    }

    // approved → criar pagamento; completed → já capturado
    let pspReferenceId = '';
    let paymentStatus = '';

    if (session.status === 'approved' && session.approvalCode) {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });
      const payment = await createNuPayPaymentFromSession({
        session,
        email: user?.email || auth.email,
        name: user?.name || auth.name,
        cpf: onlyDigits(session.shopper?.identification?.value || '')
      });
      pspReferenceId = payment.pspReferenceId;
      paymentStatus = payment.status;

      if (!isNuPayPaymentPaid(paymentStatus) && pspReferenceId) {
        const polled = await getNuPayPaymentStatus(pspReferenceId);
        paymentStatus = polled.status;
        if (typeof polled.amount?.value === 'number') {
          // keep for activation
        }
      }
    } else if (session.status === 'completed') {
      // Sessão já teve pagamento criado; tenta achar via reference-pay
      const tryId = `${session.reference}-pay`;
      try {
        // Alguns ambientes não consultam por referenceId; webhook/polling com psp id é o caminho principal.
        void tryId;
      } catch {
        /* ignore */
      }
      return NextResponse.json({
        approved: false,
        status: 'pending',
        statusDetail: 'aguardando_webhook_nupay',
        sessionId: session.id,
        reference: session.reference
      });
    }

    if (!pspReferenceId || !isNuPayPaymentPaid(paymentStatus)) {
      return NextResponse.json({
        approved: false,
        activated: false,
        status: paymentStatus || session.status,
        sessionId: session.id,
        reference: session.reference,
        pspReferenceId: pspReferenceId || undefined
      });
    }

    const payment = await getNuPayPaymentStatus(pspReferenceId);
    const activation = await activatePremiumFromNuPayPayment({
      userId,
      pspReferenceId,
      status: payment.status,
      amount: payment.amount?.value
    });

    if (activation.activated) {
      return NextResponse.json({
        approved: true,
        activated: true,
        alreadyActive: Boolean(activation.alreadyActive),
        status: activation.status,
        expiresAt: activation.expiresAt,
        email: activation.email,
        pspReferenceId,
        provider: 'nupay'
      });
    }

    return NextResponse.json({
      approved: false,
      activated: false,
      status: activation.status || payment.status,
      statusDetail: activation.reason,
      pspReferenceId
    });
  } catch (error) {
    console.error('[billing/confirm-nupay]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao confirmar NuPay.' },
      { status: 500 }
    );
  }
}
