import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-sky-600 font-bold text-xl hover:text-sky-700 transition">
          <svg className="w-6 h-6 stroke-current stroke-[2.5]" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>EveHealth</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 md:gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            Diagnostic Tests
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            My Bookings
          </NavLink>

          <NavLink
            to="/payment-console"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            Webhook & Payments
          </NavLink>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs text-slate-600">
                Hi, <strong className="text-slate-800">{user?.name}</strong>{' '}
                {user?.role === 'admin' && (
                  <span className="ml-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
