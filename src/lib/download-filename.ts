/** ID curto e único para nomes de arquivo de download. */
export function buildResolvaJatoDownloadId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

type DownloadKind = 'picture' | 'pdf';

/**
 * Nome padronizado: resolva_jato_picture_<id>.png | resolva_jato_pdf_<id>.pdf
 */
export function buildResolvaJatoDownloadName(
  kind: DownloadKind,
  extension?: string
) {
  const id = buildResolvaJatoDownloadId();
  const ext = extension ?? (kind === 'picture' ? 'png' : 'pdf');
  return `resolva_jato_${kind}_${id}.${ext}`;
}
