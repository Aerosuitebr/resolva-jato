'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select } from '@/components/ui/select';
import { FormField, fieldStateClass } from '@/components/ui/form-field';
import { useCep } from '@/hooks/use-cep';
import { emptyAddress, formatAddressLine, type AddressValue } from '@/lib/address';
import { formatCep } from '@/lib/formatters';
import { isValidCep } from '@/lib/validators';
import { cn } from '@/lib/utils';

export type { AddressValue };
export { emptyAddress, formatAddressLine };

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface AddressFieldsProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  idPrefix?: string;
}

export function AddressFields({ value, onChange, idPrefix = 'addr' }: AddressFieldsProps) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const { status, message, search } = useCep((address) => {
    onChange({
      ...valueRef.current,
      cep: formatCep(address.cep),
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    });
  });

  const cepFilled = value.cep.replace(/\D+/g, '').length === 8;
  const cepInvalid = cepFilled && !isValidCep(value.cep);
  const cepState = status === 'loading' ? 'loading' : status === 'success' ? 'valid' : cepInvalid ? 'error' : 'idle';

  function handleCepChange(masked: string) {
    onChange({ ...value, cep: masked });
    const digits = masked.replace(/\D+/g, '');
    if (digits.length === 8) {
      void search(digits);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-start">
      <FormField
        label="CEP"
        htmlFor={`${idPrefix}-cep`}
        className="sm:col-span-3"
        state={cepState}
        hint={status === 'idle' ? 'Digite o CEP para preencher automaticamente' : undefined}
        success={status === 'success' ? message : status === 'loading' ? message : undefined}
        error={status === 'not_found' || status === 'error' ? message : cepInvalid ? 'CEP incompleto.' : undefined}
      >
        <MaskedInput
          id={`${idPrefix}-cep`}
          format={formatCep}
          value={value.cep}
          onValueChange={handleCepChange}
          placeholder="00000-000"
          valid={cepState === 'valid'}
          invalid={cepState === 'error'}
        />
      </FormField>

      <FormField label="Rua / Logradouro" htmlFor={`${idPrefix}-street`} className="sm:col-span-9">
        <Input
          id={`${idPrefix}-street`}
          value={value.street}
          onChange={(event) => onChange({ ...value, street: event.target.value })}
          placeholder="Av. Paulista"
        />
      </FormField>

      <FormField label="Número" htmlFor={`${idPrefix}-number`} className="sm:col-span-3">
        <Input
          id={`${idPrefix}-number`}
          value={value.number}
          onChange={(event) => onChange({ ...value, number: event.target.value })}
          placeholder="1000"
        />
      </FormField>

      <FormField label="Complemento" htmlFor={`${idPrefix}-complement`} className="sm:col-span-9">
        <Input
          id={`${idPrefix}-complement`}
          value={value.complement}
          onChange={(event) => onChange({ ...value, complement: event.target.value })}
          placeholder="Sala 52, bloco B (opcional)"
        />
      </FormField>

      <FormField label="Bairro" htmlFor={`${idPrefix}-neighborhood`} className="sm:col-span-4">
        <Input
          id={`${idPrefix}-neighborhood`}
          value={value.neighborhood}
          onChange={(event) => onChange({ ...value, neighborhood: event.target.value })}
          placeholder="Bela Vista"
        />
      </FormField>

      <FormField label="Cidade" htmlFor={`${idPrefix}-city`} className="sm:col-span-6">
        <Input
          id={`${idPrefix}-city`}
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          placeholder="São Paulo"
        />
      </FormField>

      <FormField label="UF" htmlFor={`${idPrefix}-state`} className="sm:col-span-2">
        <Select
          id={`${idPrefix}-state`}
          value={value.state}
          onChange={(event) => onChange({ ...value, state: event.target.value })}
          className={cn('w-full', fieldStateClass('idle'))}
        >
          <option value="">--</option>
          {UF_LIST.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
