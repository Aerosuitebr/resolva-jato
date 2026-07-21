/** Remove travessões tipográficos e normaliza a pontuação para leitura natural. */
export function withoutDashes(text: string) {
  return text
    .replace(/\s*[—–]\s*/g, ': ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
