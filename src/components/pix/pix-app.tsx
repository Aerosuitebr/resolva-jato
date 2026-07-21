'use client';

import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  MessageCircle,
  QrCode,
  Smartphone,
  Wallet
} from 'lucide-react';
import { AuthGate } from '@/components/auth/auth-gate';
import { ToolsWatermark } from '@/components/brand/tools-watermark';
import { ToolsBackButton } from '@/components/shared/tools-back-button';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { WhatsAppSendModal } from '@/components/whatsapp/whatsapp-send-modal';
import { useAuth } from '@/hooks/use-auth';
import { performBillableAction } from '@/lib/billing';
import { formatCpfCnpj, formatCurrencyInput, formatPhone, parseCurrency } from '@/lib/formatters';
import { buildPixBrCode, buildPixWhatsAppMessage, normalizePixKey } from '@/lib/pix/brcode';
import type { PixKeyType } from '@/lib/pix/types';
import { isValidCnpj, isValidCpf, isValidEmail, isValidPhone } from '@/lib/validators';
import { cn } from '@/lib/utils';

const KEY_TYPES: { id: PixKeyType; label: string }[] = [
  { id: 'cpf', label: 'CPF' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'email', label: 'E-mail' },
  { id: 'phone', label: 'Telefone' },
  { id: 'random', label: 'Chave aleatória' }
];

function isValidRandomPixKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  // EVP (chave aleatória) costuma ser UUID; aceita também strings longas sem espaços
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  return trimmed.length >= 32 && !/\s/.test(trimmed);
}

function validatePixKey(key: string, keyType: PixKeyType): string {
  const trimmed = key.trim();
  if (!trimmed) return 'Informe a chave Pix.';
  if (keyType === 'cpf') {
    return isValidCpf(trimmed) ? '' : 'CPF inválido. Confira os dígitos.';
  }
  if (keyType === 'cnpj') {
    return isValidCnpj(trimmed) ? '' : 'CNPJ inválido. Confira os dígitos.';
  }
  if (keyType === 'email') {
    return isValidEmail(trimmed) ? '' : 'E-mail inválido.';
  }
  if (keyType === 'phone') {
    return isValidPhone(trimmed) ? '' : 'Telefone inválido. Use DDD + número.';
  }
  return isValidRandomPixKey(trimmed)
    ? ''
    : 'Chave aleatória não reconhecida. Cole o UUID completo do banco.';
}

export function PixApp() {
  const { toast } = useToast();
  const { session, refresh: refreshAuth } = useAuth();
  const [keyType, setKeyType] = useState<PixKeyType>('cpf');
  const [key, setKey] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCity, setMerchantCity] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touchedKey, setTouchedKey] = useState(false);
  const [waModal, setWaModal] = useState<{ message: string } | null>(null);

  const ownerEmail = (session?.user.email || '').trim().toLowerCase();
  const amount = parseCurrency(amountInput);

  const keyError = useMemo(() => validatePixKey(key, keyType), [key, keyType]);
  const nameError = merchantName.trim() ? '' : 'Nome do receptor obrigatório.';
  const cityError = merchantCity.trim() ? '' : 'Cidade obrigatória.';
  const amountError =
    amountInput.trim() && amount <= 0 ? 'Valor inválido. Informe um valor maior que zero ou deixe em branco.' : '';
  const whatsappError =
    clientWhatsapp.trim() && !isValidPhone(clientWhatsapp)
      ? 'WhatsApp inválido. Use DDD + número.'
      : '';

  const canGenerate = !keyError && !nameError && !cityError && !amountError;
  const showKeyError = touchedKey || key.trim().length > 0 ? keyError : '';

  const brCode = useMemo(() => {
    if (!canGenerate) return '';
    return buildPixBrCode({
      key,
      keyType,
      merchantName,
      merchantCity,
      amount: amount > 0 ? amount : undefined,
      description,
      txid: description ? description.replace(/\W+/g, '').slice(0, 20) : '***'
    });
  }, [amount, canGenerate, description, key, keyType, merchantCity, merchantName]);

  const readiness = useMemo(
    () => [
      { label: 'Chave Pix válida', done: !keyError && Boolean(key.trim()) },
      { label: 'Nome do receptor', done: !nameError },
      { label: 'Cidade', done: !cityError }
    ],
    [key, keyError, nameError, cityError]
  );

  function formatKeyInput(value: string) {
    if (keyType === 'cpf' || keyType === 'cnpj') return formatCpfCnpj(value);
    if (keyType === 'phone') return formatPhone(value);
    return value;
  }

  async function chargeAndRun(effect: () => Promise<void> | void, artifact: string) {
    setError('');
    setTouchedKey(true);
    setBusy(true);
    try {
      if (!brCode) {
        setError(
          showKeyError || nameError || cityError || amountError || 'Preencha chave Pix, nome e cidade.'
        );
        return;
      }
      const outcome = await performBillableAction(
        { toolId: 'pix', artifactId: artifact, action: 'download' },
        async () => {
          await effect();
          return true;
        }
      );
      if (!outcome.allowed) {
        setError(outcome.reason || 'Seu saldo não permite esta ação agora.');
        return;
      }
      refreshAuth();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyCode() {
    await chargeAndRun(async () => {
      await navigator.clipboard.writeText(brCode);
      toast('Código Pix copiado!');
    }, `pix_copy_${Date.now()}`);
  }

  async function handleWhatsAppMessage() {
    if (!ownerEmail) {
      setError('Faça login novamente para enviar pelo WhatsApp.');
      return;
    }
    if (whatsappError) {
      setError(whatsappError);
      return;
    }

    await chargeAndRun(async () => {
      const message = buildPixWhatsAppMessage({
        merchantName,
        amount: amount > 0 ? amount : undefined,
        brCode,
        description
      });
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        // Modal ainda abre mesmo se o clipboard falhar.
      }
      setWaModal({ message });
      toast('Mensagem pronta para enviar no WhatsApp.');
    }, `pix_wa_${Date.now()}`);
  }

  return (
    <AuthGate
      title="Cobrança Pix exige cadastro"
      description="Crie sua conta gratuita para gerar QR Code Pix e mensagens de cobrança."
    >
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-5 py-6 text-white sm:px-6">
            <ToolsWatermark />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Wallet className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                    Microferramenta
                  </p>
                  <h1 className="rj-display mt-1 text-2xl font-extrabold tracking-tight">
                    Cobrança Pix com QR Code
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                    Gere QR e Pix Copia e Cola no navegador — sem API bancária. Copiar ou enviar consome 1
                    utilização.
                  </p>
                </div>
              </div>
              <ToolsBackButton
                size="default"
                className="shrink-0 border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 hover:text-white"
              />
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Tipo de chave
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Escolha o formato e informe a chave com máscara automática.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FormField label="Formato" htmlFor="pix-key-type">
                    <Select
                      id="pix-key-type"
                      value={keyType}
                      onChange={(event) => {
                        setKeyType(event.target.value as PixKeyType);
                        setKey('');
                        setTouchedKey(false);
                        setError('');
                      }}
                    >
                      {KEY_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField
                    label="Chave Pix"
                    required
                    htmlFor="pix-key"
                    error={showKeyError || undefined}
                    success={!keyError && key.trim() ? 'Chave reconhecida.' : undefined}
                  >
                    {keyType === 'email' || keyType === 'random' ? (
                      <Input
                        id="pix-key"
                        value={key}
                        onChange={(event) => setKey(event.target.value)}
                        onBlur={() => setTouchedKey(true)}
                        placeholder={
                          keyType === 'email'
                            ? 'email@exemplo.com'
                            : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                        }
                        className={cn(
                          showKeyError && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
                          !keyError &&
                            key.trim() &&
                            'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                        )}
                      />
                    ) : (
                      <MaskedInput
                        id="pix-key"
                        format={formatKeyInput}
                        value={key}
                        onValueChange={setKey}
                        onBlur={() => setTouchedKey(true)}
                        placeholder={
                          keyType === 'phone'
                            ? '(62) 99999-0000'
                            : keyType === 'cnpj'
                              ? '00.000.000/0000-00'
                              : '000.000.000-00'
                        }
                        invalid={Boolean(showKeyError)}
                        valid={!keyError && key.trim().length > 0}
                      />
                    )}
                  </FormField>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                  Dados do receptor
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FormField
                    label="Nome do receptor"
                    required
                    htmlFor="pix-merchant-name"
                    error={merchantName.length > 0 && nameError ? nameError : undefined}
                  >
                    <Input
                      id="pix-merchant-name"
                      value={merchantName}
                      onChange={(event) => setMerchantName(event.target.value)}
                      placeholder="Como aparece no Pix"
                      maxLength={25}
                    />
                  </FormField>
                  <FormField
                    label="Cidade"
                    required
                    htmlFor="pix-merchant-city"
                    error={merchantCity.length > 0 && cityError ? cityError : undefined}
                  >
                    <Input
                      id="pix-merchant-city"
                      value={merchantCity}
                      onChange={(event) => setMerchantCity(event.target.value)}
                      placeholder="Cidade"
                      maxLength={15}
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Valor (opcional)"
                  htmlFor="pix-amount"
                  error={amountError || undefined}
                  hint={!amountInput.trim() ? 'Deixe em branco para valor livre' : undefined}
                >
                  <MaskedInput
                    id="pix-amount"
                    format={formatCurrencyInput}
                    value={amountInput}
                    onValueChange={setAmountInput}
                    placeholder="R$ 0,00"
                    invalid={Boolean(amountError)}
                    valid={amount > 0}
                  />
                </FormField>
                <FormField label="Descrição / identificador" htmlFor="pix-description">
                  <Input
                    id="pix-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Ex.: Pedido 128"
                    maxLength={72}
                  />
                </FormField>
              </div>

              <FormField
                label="WhatsApp do cliente (opcional)"
                htmlFor="pix-client-wa"
                error={whatsappError || undefined}
                hint="Usado ao enviar a cobrança. Você também pode informar na modal."
              >
                <div className="relative">
                  <Smartphone
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <MaskedInput
                    id="pix-client-wa"
                    format={formatPhone}
                    value={clientWhatsapp}
                    onValueChange={setClientWhatsapp}
                    placeholder="(62) 99999-0000"
                    className="pl-10"
                    invalid={Boolean(whatsappError)}
                    valid={Boolean(clientWhatsapp.trim() && isValidPhone(clientWhatsapp))}
                  />
                </div>
              </FormField>

              {error ? (
                <p className="flex items-start gap-2 text-sm font-semibold text-rose-600" role="alert">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="success"
                  icon={Copy}
                  loading={busy}
                  onClick={handleCopyCode}
                  disabled={busy || !brCode}
                >
                  Copiar código Pix
                </Button>
                <Button
                  type="button"
                  icon={MessageCircle}
                  loading={busy}
                  onClick={handleWhatsAppMessage}
                  disabled={busy || !brCode}
                >
                  Enviar no WhatsApp
                </Button>
                <ToolsBackButton size="default" />
              </div>
            </div>

            <aside className="rounded-[24px] border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white">
                  <QrCode className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">
                    Pagamento Pix
                  </p>
                  <p className="text-xs font-medium text-slate-600">QR + Copia e Cola</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                {brCode
                  ? 'Pronto para pagar: escaneie o QR ou copie o código.'
                  : 'Preencha chave válida, nome e cidade — o QR aparece aqui.'}
              </p>

              <ul className="mt-4 space-y-1.5">
                {readiness.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                    )}
                    <span className={item.done ? 'font-medium text-slate-800' : 'font-medium text-amber-900'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-emerald-300 bg-white p-6">
                {brCode ? (
                  <QRCodeSVG value={brCode} size={220} level="M" includeMargin />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div
                      className="grid h-[140px] w-[140px] grid-cols-5 gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 opacity-70"
                      aria-hidden
                    >
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={cn(
                            'rounded-[2px]',
                            [0, 1, 2, 4, 5, 6, 10, 14, 18, 20, 21, 22, 24].includes(index)
                              ? 'bg-slate-400'
                              : 'bg-slate-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className="max-w-[16rem] text-sm font-medium text-slate-600">
                      Miniatura de exemplo — o QR real aparece após validar a chave.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                    Pix Copia e Cola
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="success"
                    icon={Copy}
                    loading={busy}
                    disabled={busy || !brCode}
                    onClick={handleCopyCode}
                  >
                    Copiar
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={brCode}
                  className="mt-3 h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-5 text-slate-800"
                  placeholder="Ex.: 00020126580014br.gov.bcb.pix…"
                  onFocus={(event) => event.target.select()}
                />
                <p className="mt-2 text-xs font-medium leading-5 text-slate-600">
                  No app do banco: Pix → Copia e Cola → cole o código.
                </p>
              </div>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-700">
                Chave normalizada
              </p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">
                {key && !keyError ? normalizePixKey(key, keyType) : '—'}
              </p>
            </aside>
          </div>
        </section>

        {waModal && ownerEmail ? (
          <WhatsAppSendModal
            open={Boolean(waModal)}
            onClose={() => setWaModal(null)}
            ownerEmail={ownerEmail}
            toPhone={clientWhatsapp}
            message={waModal.message}
            destinationHint="WhatsApp do cliente / pagador"
          />
        ) : null}
      </div>
    </AuthGate>
  );
}
