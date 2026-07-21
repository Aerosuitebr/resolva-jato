import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import rjEscuro from '@/assets/RJ_escuro.png';
import { Logo } from '@/components/brand/logo';

interface AuthShellProps {
  children: ReactNode;
  subtitle: string;
}

export function AuthShell({ children, subtitle }: AuthShellProps) {
  return (
    <main className="rj-auth-ambient relative isolate min-h-screen overflow-x-hidden px-4 py-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rj-auth-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
        <div className="rj-auth-blob-delay absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="rj-auth-blob absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-100/50 blur-3xl" />

        <div className="rj-auth-mark absolute left-[8%] top-[12%] w-36 sm:w-44">
          <Image src={rjEscuro} alt="" className="h-auto w-full object-contain" />
        </div>
        <div className="rj-auth-mark absolute bottom-[14%] right-[10%] w-40 [animation-delay:-4s] sm:w-48">
          <Image src={rjEscuro} alt="" className="h-auto w-full object-contain" />
        </div>
        <div className="rj-auth-mark absolute right-[18%] top-[22%] hidden w-32 [animation-delay:-7s] md:block">
          <Image src={rjEscuro} alt="" className="h-auto w-full rotate-12 object-contain" />
        </div>
        <div className="rj-auth-mark absolute bottom-[28%] left-[16%] hidden w-36 [animation-delay:-2s] lg:block">
          <Image src={rjEscuro} alt="" className="h-auto w-full -rotate-6 object-contain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center py-4">
        <section className="w-full rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-8">
          <Link href="/" className="mx-auto mb-4 flex justify-center" aria-label="Página inicial Resolva Jato">
            <Logo variant="auth" />
          </Link>
          <p className="mb-5 text-center text-sm leading-6 text-slate-600">{subtitle}</p>
          {children}
        </section>
      </div>
    </main>
  );
}
