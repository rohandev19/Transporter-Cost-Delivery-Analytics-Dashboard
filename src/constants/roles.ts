import { UserRole, RolePermissions, DemoCredential } from '../types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canUpload: true,
    canExport: true,
    canEdit: true,
    canDelete: true,
    canViewDashboard: true,
    canViewAnalytics: true
  },
  supervisor: {
    canUpload: false,
    canExport: true,
    canEdit: false,
    canDelete: false,
    canViewDashboard: true,
    canViewAnalytics: true
  },
  viewer: {
    canUpload: false,
    canExport: false,
    canEdit: false,
    canDelete: false,
    canViewDashboard: true,
    canViewAnalytics: true
  }
};

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'admin',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    description: 'Full access - can upload, export, and manage all data'
  },
  {
    role: 'supervisor',
    name: 'Supervisor Demo',
    email: 'supervisor@demo.com',
    description: 'Can view all analytics and export reports'
  },
  {
    role: 'viewer',
    name: 'Viewer Demo',
    email: 'viewer@demo.com',
    description: 'Read-only access to dashboard and analytics'
  }
];
