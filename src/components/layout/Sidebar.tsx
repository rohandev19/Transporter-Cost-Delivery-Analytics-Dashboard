import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { 
  LayoutDashboard, Upload, Table, Users, Truck, 
  AlertTriangle, FileText, Settings 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Upload,
  Table,
  Users,
  Truck,
  AlertTriangle,
  FileText,
  Settings,
};

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const visibleItems = NAVIGATION_ITEMS.filter((item) =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Transporter Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Cost & Delivery Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </aside>
  );
}
