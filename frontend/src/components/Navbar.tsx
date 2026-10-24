import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-ink-800 text-gold-400' : 'text-ink-200 hover:text-white'}`;

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8" aria-label="Main">
        <Logo />
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Showroom
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Inventory
            </NavLink>
          )}
        </div>
        {user && (
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-ink-400">{isAdmin ? 'Administrator' : 'Customer'}</p>
            </div>
            <button type="button" onClick={handleLogout} className="btn-ghost px-3 py-1.5">
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
