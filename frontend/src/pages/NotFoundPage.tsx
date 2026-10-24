import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl text-gold-400">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">This road leads nowhere</h1>
      <p className="mt-2 text-ink-400">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to the showroom
      </Link>
    </div>
  );
}
