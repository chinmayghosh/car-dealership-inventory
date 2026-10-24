import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2" aria-label="Apex Motors home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-ink-800" />
        <path d="M8 22 16 8l8 14h-4l-4-7-4 7z" className="fill-gold-400" />
      </svg>
      <span className="font-display text-xl tracking-wide text-white">
        Apex <span className="text-gold-400">Motors</span>
      </span>
    </Link>
  );
}
