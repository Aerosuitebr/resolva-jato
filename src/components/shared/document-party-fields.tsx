'use client';

import { useCallback, useRef, useState } from 'react';
import { AddressFields } from '@/components/shared/address-fields';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { useCnpj } from '@/hooks/use-cnpj';
import {
  formatPartyAddressLine,
  normalizeDocumentParty,
  partyToAddress,
  type DocumentPartyValue
} from '@/lib/document-party';
import { formatCep, formatCpfCnpj, formatPhone } from '@/lib/formatters';
import { isValidCpf, isValidCpfCnpj } from '@/lib/validators';

export type { DocumentPartyValue };
export { formatPartyAddressLine, normalizeDocumentParty, partyToAddress };

interface DocumentPartyFieldsProps {
  title: string;
  party: DocumentPartyValue;
  onChange: (patch: Partial<DocumentPartyValue>) => void;
  idPrefix?: string;
  showContact?: boolean;
}

export function DocumentPartyFields({
  title,
  party,
  onChange,
  idPrefix = 'party',
  showContact = false
}: DocumentPartyFieldsProps) {
  const partyRef = useRef(party);
  partyRef.current = party;
  const [cpfHint, setCpfHint] = useState('');

  const applyCompany = useCallback(
    (company: {
      name: string;
      email: string;
      phone: string;
      cep: string;
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
    }) => {
      const current = partyRef.current;
      onChange({
        name: company.name || current.name,
        nationality: 'brasileira',
        maritalStatus: current.maritalStatus || 'pessoa jurídica',
        profession: current.profession || 'atividade empresarial',
        email: company.email || current.email,
        phone: company.phone ? formatPhone(company.phone) : current.phone,
        cep: company.cep ? formatCep(company.cep) : current.cep,
        street: company.street || current.street,
        number: company.number || current.number,
        complement: company.complement || current.complement,
        neighborhood: company.neighborhood || current.neighborhood,
        city: company.city || current.city,
        state: company.state || current.state
      });
    },
    [onChange]
  );

  const { status, message, search } = useCnpj(applyCompany);

  const digits = party.document.replace(/\D+/g, '');
  const docFilled = digits.length === 11 || digits.length === 14;
  const docInvalid = docFilled && !isValidCpfCnpj(party.document);
  const docState =
    status === 'loading'
      ? 'loading'
      : status === 'success'
        ? 'valid'
        : docInvalid
          ? 'error'
          : status === 'not_found' || status === 'error'
            ? 'error'
            : 'idle';

  function handleDocumentChange(masked: string) {
    onChange({ document: masked });
    setCpfHint('');
    const nextDigits = masked.replace(/\D+/g, '');
    if (nextDigits.length === 14) {
      void search(nextDigits);
      return;
    }
    if (nextDigits.length === 11) {
      if (isValidCpf(masked)) {
        setCpfHint('CPF válido. Dados pessoais não são consultados na Receita (LGPD).');
      } else {
        setCpfHint('CPF inválido. Confira os dígitos.');
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="rj-display text-base font-bold text-slate-950">{title}</h3>
      <FormField label="Nome completo / razão social" hint="Como deve aparecer no contrato.">
        <Input
          value={party.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Nome completo ou razão social"
          className="text-slate-950"
        />
      </FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
        <FormField
          label="CPF / CNPJ"
          htmlFor={`${idPrefix}-document`}
          className="min-w-0"
          state={docState}
          hint={!docFilled ? 'CNPJ busca dados na Receita automaticamente' : undefined}
          success={
            status === 'success' || status === 'loading'
              ? message
              : digits.length === 11 && isValidCpf(party.document)
                ? cpfHint
                : undefined
          }
          error={
            status === 'not_found' || status === 'error'
              ? message
              : docInvalid
                ? 'CPF/CNPJ inválido.'
                : digits.length === 11 && !isValidCpf(party.document)
                  ? cpfHint
                  : undefined
          }
        >
          <MaskedInput
            id={`${idPrefix}-document`}
            format={formatCpfCnpj}
            value={party.document}
            onValueChange={handleDocumentChange}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            valid={docState === 'valid'}
            invalid={docState === 'error'}
          />
        </FormField>
        <FormField label="Profissão / atividade" className="min-w-0">
          <Input
            value={party.profession}
            onChange={(event) => onChange({ profession: event.target.value })}
            placeholder="Profissão"
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
        <FormField label="Nacionalidade" className="min-w-0">
          <Input
            value={party.nationality}
            onChange={(event) => onChange({ nationality: event.target.value })}
          />
        </FormField>
        <FormField label="Estado civil" className="min-w-0">
          <Input
            value={party.maritalStatus}
            onChange={(event) => onChange({ maritalStatus: event.target.value })}
            placeholder="solteiro(a), casado(a), pessoa jurídica..."
          />
        </FormField>
      </div>

      {showContact ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
          <FormField label="E-mail" className="min-w-0">
            <Input
              value={party.email}
              onChange={(event) => onChange({ email: event.target.value })}
              placeholder="email@empresa.com"
            />
          </FormField>
          <FormField label="Telefone" className="min-w-0">
            <MaskedInput
              format={formatPhone}
              value={party.phone}
              onValueChange={(masked) => onChange({ phone: masked })}
              placeholder="(62) 99999-0000"
            />
          </FormField>
        </div>
      ) : null}

      <AddressFields
        idPrefix={idPrefix}
        value={partyToAddress(party)}
        onChange={(address) => onChange(address)}
      />
    </div>
  );
}
