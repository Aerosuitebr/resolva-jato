import type { SignatureStyleId } from './types';

export interface SignatureTemplate {
  id: SignatureStyleId;
  name: string;
  description: string;
  recommended?: boolean;
  className: string;
  previewClassName: string;
}

export const SIGNATURE_TEMPLATES: SignatureTemplate[] = [
  {
    id: 'elegante',
    name: 'Elegante',
    description: 'Traço cursivo fluido, ideal para autônomos e prestadores de serviço.',
    recommended: true,
    className: 'rj-signature-elegante',
    previewClassName: 'text-3xl'
  },
  {
    id: 'executivo',
    name: 'Executivo',
    description: 'Serifado refinado para propostas e documentos corporativos.',
    recommended: true,
    className: 'rj-signature-executivo',
    previewClassName: 'text-2xl'
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Caligrafia ornamental para recibos e contratos formais.',
    className: 'rj-signature-classico',
    previewClassName: 'text-3xl'
  },
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Sans-serif limpo com presença, bom para marcas digitais.',
    recommended: true,
    className: 'rj-signature-moderno',
    previewClassName: 'text-xl tracking-[0.08em]'
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Itálico discreto para uso institucional e acadêmico.',
    className: 'rj-signature-formal',
    previewClassName: 'text-2xl'
  }
];

export function getSignatureTemplate(id: SignatureStyleId) {
  return SIGNATURE_TEMPLATES.find((item) => item.id === id) ?? SIGNATURE_TEMPLATES[0];
}
