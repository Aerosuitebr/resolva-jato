export type SignatureStyleId = 'elegante' | 'executivo' | 'classico' | 'moderno' | 'formal';

export interface DigitalSignature {
  enabled: boolean;
  text: string;
  styleId: SignatureStyleId;
  showLine: boolean;
}

export function createDefaultSignature(name = ''): DigitalSignature {
  return {
    enabled: true,
    text: name,
    styleId: 'elegante',
    showLine: true
  };
}

export function normalizeSignature(value: DigitalSignature | undefined, fallbackName = ''): DigitalSignature {
  if (!value) return createDefaultSignature(fallbackName);
  return {
    enabled: value.enabled ?? true,
    text: value.text ?? fallbackName,
    styleId: value.styleId ?? 'elegante',
    showLine: value.showLine ?? true
  };
}
