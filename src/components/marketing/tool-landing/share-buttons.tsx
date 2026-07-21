'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Facebook, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const WHATSAPP_ICON_PATH =
  'M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.85c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.8 11.8 0 0 0 5.63 1.44h.01c6.54 0 11.85-5.3 11.85-11.85 0-3.17-1.23-6.14-3.37-8.43ZM12.04 21.4a9.4 9.4 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.36 9.36 0 0 1-1.44-4.96c0-5.19 4.23-9.42 9.44-9.42 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.4-9.37 9.4Zm5.16-7.03c-.28-.14-1.66-.82-1.92-.91-.26-.1-.44-.14-.63.14-.19.28-.72.91-.88 1.1-.16.19-.33.2-.6.07-.28-.14-1.17-.43-2.23-1.37a8.36 8.36 0 0 1-1.54-1.91c-.16-.28-.02-.43.13-.57.14-.14.32-.36.48-.54.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.55-.09-.14-.55-1.33-.76-1.83-.2-.48-.4-.42-.55-.42-.14 0-.31 0-.48.01-.16.01-.42.06-.64.31-.22.25-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.65 2.51 4 3.42 2.35.9 2.35.6 2.77.56.42-.03 1.36-.55 1.55-1.09.19-.53.19-.98.13-1.09-.05-.1-.23-.16-.51-.3Z';

export function ToolLandingShare({ toolName, className }: { toolName: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const text = `Achei essa ferramenta pra gerar ${toolName.toLowerCase()} online, de graça: `;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencioso — clipboard pode ser bloqueado
    }
  }

  const items = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}${encodedUrl}`,
      icon: (props: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden>
          <path d={WHATSAPP_ICON_PATH} />
        </svg>
      )
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook
    },
    {
      label: 'E-mail',
      href: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
      icon: Mail
    }
  ];

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-sm font-semibold text-slate-600">Compartilhar:</span>
      {items.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Compartilhar no ${label}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Icon className="h-4.5 w-4.5" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar link"
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
