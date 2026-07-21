/** Domínios de e-mail temporário / descartável (lista local). */
const DISPOSABLE_DOMAINS = new Set(
  [
    '10minutemail.com',
    '10minutemail.net',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamailblock.com',
    'sharklasers.com',
    'grr.la',
    'guerrillamail.biz',
    'mailinator.com',
    'mailinator.net',
    'mailinator2.com',
    'tempmail.com',
    'temp-mail.org',
    'temp-mail.io',
    'tmpmail.org',
    'tmpmail.net',
    'throwawaymail.com',
    'yopmail.com',
    'yopmail.fr',
    'yopmail.net',
    'trashmail.com',
    'trashmail.me',
    'trashmail.net',
    'getnada.com',
    'nada.email',
    'dispostable.com',
    'mailnesia.com',
    'maildrop.cc',
    'mintemail.com',
    'fakeinbox.com',
    'emailondeck.com',
    'moakt.com',
    'tempail.com',
    'tempr.email',
    'discard.email',
    'discardmail.com',
    'mailcatch.com',
    'mytemp.email',
    'tempinbox.com',
    'throwaway.email',
    'getairmail.com',
    'spamgourmet.com',
    'mailnull.com',
    'spam4.me',
    'mailforspam.com',
    'trash-mail.com',
    'wegwerfmail.de',
    'wegwerfmail.net',
    'jetable.org',
    'kasmail.com',
    'spamfree24.org',
    'emailtemporanea.com',
    'emailtemporario.com.br',
    'correotemporal.org',
    'tempmailo.com',
    '1secmail.com',
    '1secmail.org',
    '1secmail.net',
    'mohmal.com',
    'inboxkitten.com',
    'mailpoof.com',
    'burnermail.io',
    'GuerrillaMail.com'.toLowerCase()
  ].map((d) => d.toLowerCase())
);

function extractDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at < 1 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // subdomínios comuns de provedores temp
  for (const blocked of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

export function getEmailDomain(email: string) {
  return extractDomain(email);
}
