import { UserRole } from '../types/auth';

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/upload',
    label: 'Upload Data',
    icon: 'Upload',
    allowedRoles: ['admin']
  },
  {
    path: '/operations',
    label: 'Operations Table',
    icon: 'Table',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/drivers',
    label: 'Driver Analytics',
    icon: 'Users',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/vehicles',
    label: 'Vehicle Analytics',
    icon: 'Truck',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/anomalies',
    label: 'Anomaly Center',
    icon: 'AlertTriangle',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'FileText',
    allowedRoles: ['admin', 'supervisor', 'viewer']
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'Settings',
    allowedRoles: ['admin']
  }
];
