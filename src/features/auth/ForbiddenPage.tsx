import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-2">
          Your current role (<strong className="capitalize">{user?.role}</strong>) 
          does not have permission to access this page.
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Please contact an administrator if you believe you should have access to this feature.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
