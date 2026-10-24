import type { ReactNode } from 'react';
import { Logo } from './Logo';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80';

/** Split-screen frame for the login and register pages: a hero photo beside the form. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <p className="font-display text-4xl leading-tight text-white">Find the car that moves you.</p>
          <p className="mt-3 text-ink-200">Hand-picked performance, luxury and everyday vehicles, all in one showroom.</p>
        </div>
      </div>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-10 font-display text-3xl text-white">{title}</h1>
          <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
