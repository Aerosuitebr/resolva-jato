import { NextResponse } from 'next/server';
import { activatePremiumFromNuPayPayment } from '@/lib/billing-server';
import { onlyDigits } from '@/lib/cpf';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  createNuPayPaymentFromSession,
  getNuPayPaymentStatus,
  getNuPaySession,
  isNuPayConfigured,
  isNuPayPaymentPaid,
  parseUserIdFromNuPayReference
} from '@/lib/nupay';

/**
 * Webhook NuPay (sessão e/ou pagamento).
 * Notificação de sessão traz só sessionId + reference — reconsulta status na API.
 */
export async function POST(request: Request) {
  try {
    if (!isNuPayConfigured() || !isDatabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: string;
      reference?: string;
      pspReferenceId?: string;
      status?: string;
    };

    const sessionId = body.sessionId || '';
    const pspReferenceId = body.pspReferenceId || '';

    if (sessionId) {
      const session = await getNuPaySession(sessionId);
      const userId = parseUserIdFromNuPayReference(session.reference);
      console.info('[nupay-webhook] session', {
        sessionId: session.id,
        status: session.status,
        reference: session.reference,
        userId
      });

      if (!userId) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      if (session.status === 'approved' && session.approvalCode) {
        const user = await getPrisma().user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });
        if (!user) return NextResponse.json({ ok: true, ignored: true });

        const payment = await createNuPayPaymentFromSession({
          session,
          email: user.email,
          name: user.name,
          cpf: onlyDigits(session.shopper?.identification?.value || '')
        });

        let status = payment.status;
        if (!isNuPayPaymentPaid(status) && payment.pspReferenceId) {
          const polled = await getNuPayPaymentStatus(payment.pspReferenceId);
          status = polled.status;
        }

        if (isNuPayPaymentPaid(status)) {
          const amountCheck = await getNuPayPaymentStatus(payment.pspReferenceId);
          const activation = await activatePremiumFromNuPayPayment({
            userId,
            pspReferenceId: payment.pspReferenceId,
            status: amountCheck.status,
            amount: amountCheck.amount?.value
          });
          console.info('[nupay-webhook] activated', activation);
          return NextResponse.json({ ok: true, activated: activation.activated });
        }

        return NextResponse.json({
          ok: true,
          paymentStatus: status,
          pspReferenceId: payment.pspReferenceId
        });
      }

      return NextResponse.json({ ok: true, sessionStatus: session.status });
    }

    if (pspReferenceId) {
      const payment = await getNuPayPaymentStatus(pspReferenceId);
      console.info('[nupay-webhook] payment', {
        pspReferenceId,
        status: payment.status
      });
      const userId = parseUserIdFromNuPayReference(payment.referenceId.replace(/-pay$/, ''));
      if (userId && isNuPayPaymentPaid(payment.status)) {
        const activation = await activatePremiumFromNuPayPayment({
          userId,
          pspReferenceId,
          status: payment.status,
          amount: payment.amount?.value
        });
        return NextResponse.json({ ok: true, activated: activation.activated });
      }
      return NextResponse.json({ ok: true, status: payment.status });
    }

    console.info('[nupay-webhook] ignored', body);
    return NextResponse.json({ ok: true, ignored: true });
  } catch (error) {
    console.error('[nupay-webhook]', error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'nupay-webhook' });
}
