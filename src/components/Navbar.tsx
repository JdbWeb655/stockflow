import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { UpgradeModal } from './UpgradeModal';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Gestión de Inventario' },
  { to: '/sales', label: 'Historial de Ventas' },
  { to: '/profile', label: 'Mi Perfil' },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const setShowSaleModal = useUiStore((state) => state.setShowSaleModal);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const businessName = user?.name ?? 'Mi Negocio';

  const handleLogout = async (): Promise<void> => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const handleOpenSaleModal = (): void => {
    setShowSaleModal(true);
    setMenuOpen(false);
  };

  const handleNavigate = (): void => {
    setMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-white">{businessName}</h1>
        {user && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              user.plan === 'PREMIUM'
                ? 'bg-yellow-500 text-yellow-900'
                : 'bg-slate-600 text-slate-300'
            }`}
          >
            {user.plan}
          </span>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex md:hidden p-2 text-slate-400 hover:text-slate-200"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              location.pathname === link.to
                ? 'text-emerald-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }
          >
            {link.to === '/profile' && <User className="inline w-4 h-4 mr-1" />}
            {link.label}
          </Link>
        ))}

        <button
          onClick={handleOpenSaleModal}
          className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Registrar Venta
        </button>

        {user?.plan === 'FREE' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-3 py-1 text-sm bg-yellow-500 text-yellow-900 rounded hover:bg-yellow-400"
          >
            Upgrade a PREMIUM
          </button>
        )}

        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700"
        >
          Logout
        </button>
      </nav>

      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-800 border-b border-slate-700 p-4 md:hidden flex flex-col gap-4 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleNavigate}
              className={
                location.pathname === link.to
                  ? 'text-emerald-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }
            >
              {link.to === '/profile' && <User className="inline w-4 h-4 mr-1" />}
              {link.label}
            </Link>
          ))}

          <button
            onClick={handleOpenSaleModal}
            className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 w-full text-left"
          >
            Registrar Venta
          </button>

          {user?.plan === 'FREE' && (
            <button
              onClick={() => { setShowUpgradeModal(true); setMenuOpen(false); }}
              className="px-3 py-1 text-sm bg-yellow-500 text-yellow-900 rounded hover:bg-yellow-400 w-full text-left"
            >
              Upgrade a PREMIUM
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 w-full text-left"
          >
            Logout
          </button>
        </div>
      )}

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </header>
  );
};
