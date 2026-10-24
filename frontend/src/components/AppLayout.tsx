import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/** Frame for every signed-in page: navbar, page content and footer. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-800 py-6 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} Apex Motors · Car Dealership Inventory System
      </footer>
    </div>
  );
}
