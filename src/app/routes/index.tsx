import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import AppLayout from '../../components/layout/AppLayout';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('../../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../../features/dashboard/DashboardPage'));
const UploadPage = lazy(() => import('../../features/upload/UploadPage'));
const OperationsPage = lazy(() => import('../../features/operations/OperationsPage'));
const DriversPage = lazy(() => import('../../features/drivers/DriversPage'));
const VehiclesPage = lazy(() => import('../../features/vehicles/VehiclesPage'));
const AnomaliesPage = lazy(() => import('../../features/anomalies/AnomaliesPage'));
const ReportsPage = lazy(() => import('../../features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('../../features/settings/SettingsPage'));
const ForbiddenPage = lazy(() => import('../../features/auth/ForbiddenPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Role-based Route wrapper
function RoleRoute({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission: 'canUpload' | 'canExport' | 'canEdit';
}) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  
  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/forbidden" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'upload',
        element: (
          <RoleRoute requiredPermission="canUpload">
            <Suspense fallback={<PageLoader />}>
              <UploadPage />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: 'operations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OperationsPage />
          </Suspense>
        ),
      },
      {
        path: 'drivers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DriversPage />
          </Suspense>
        ),
      },
      {
        path: 'vehicles',
        element: (
          <Suspense fallback={<PageLoader />}>
            <VehiclesPage />
          </Suspense>
        ),
      },
      {
        path: 'anomalies',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AnomaliesPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleRoute requiredPermission="canEdit">
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: 'forbidden',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForbiddenPage />
          </Suspense>
        ),
      },
    ],
  },
]);
