import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Resolva Jato — Orçamento com Pix no WhatsApp';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(145deg, #020617 0%, #0f172a 45%, #064e3b 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#fbbf24'
          }}
        >
          Resolva Jato
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            Mande o orçamento. Cliente aprova. Pix na hora.
          </div>
          <div style={{ fontSize: 28, color: '#cbd5e1', maxWidth: 900 }}>
            Sem app, sem cartão — cobrança profissional no WhatsApp.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#86efac' }}>resolvajato.com.br</div>
      </div>
    ),
    { ...size }
  );
}
