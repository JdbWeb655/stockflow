import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginStore = useAuthStore(state => state);
  const { signIn, signInWithPassword } = loginStore;
  const loading = loginStore.loading;
  const error = loginStore.error;
  const clearError = loginStore.clearError;
  const navigate = useNavigate();

  const handleSignInWithPassword = async () => {
    clearError();
    if (!password) {
      return;
    }
    try {
      await signInWithPassword(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleSendMagicLink = async () => {
    clearError();
    try {
      await signIn(email);
    } catch (err) {
      setError(err.message || 'Error al enviar enlace mágico');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-sm">
        <form className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">
            Iniciar Sesión
          </h2>
          <input
            type="email"
            required
            placeholder="correo@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       placeholder:text-slate-400"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       placeholder:text-slate-400"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleSignInWithPassword}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg
                       hover:bg-emerald-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={handleSendMagicLink}
            disabled={loading}
            className="w-full py-3 bg-slate-600 text-white font-semibold rounded-lg
                       hover:bg-slate-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar enlace mágico
          </button>
        </form>
      </div>
    </div>
  );
};