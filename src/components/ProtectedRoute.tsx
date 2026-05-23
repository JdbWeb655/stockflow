import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const session = useAuthStore(state => state.session);
  const loading = useAuthStore(state => state.loading);
  const initialized = useAuthStore(state => state.initialized);

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
