// Auth types for frontend simulation
export type UserRole = 'admin' | 'supervisor' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Role permissions
export interface RolePermissions {
  canUpload: boolean;
  canExport: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
}

// Demo credentials
export interface DemoCredential {
  role: UserRole;
  name: string;
  email: string;
  description: string;
}
