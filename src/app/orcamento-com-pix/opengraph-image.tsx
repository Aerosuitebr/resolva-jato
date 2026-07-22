import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Gerador de orçamento com Pix — Resolva Jato';
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
          background: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#fbbf24' }}>
          ORÇAMENTO + PIX
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>
            Cliente aprova no celular. Você recebe no Pix.
          </div>
          <div style={{ fontSize: 26, color: '#bbf7d0' }}>
            Link público · WhatsApp · grátis para testar
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#a7f3d0' }}>resolvajato.com.br</div>
      </div>
    ),
    { ...size }
  );
}
