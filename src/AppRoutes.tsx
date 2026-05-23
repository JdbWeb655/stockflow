import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedLayout } from './components/ProtectedLayout';
import { PublicCatalog } from './components/PublicCatalog';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SalesPage } from './pages/sales/SalesPage';
import { ProductEditPage } from './pages/products/ProductEditPage';

export const AppRoutes = () => {
  return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<AuthForm />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Products />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProductEditPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SalesPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/:username/catalog" element={<PublicCatalog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};
