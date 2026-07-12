import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { DEMO_CREDENTIALS } from '../../constants/roles';
import { UserRole } from '../../types/auth';
import { LogIn, Shield, Eye, Users } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleLogin = () => {
    const credential = DEMO_CREDENTIALS.find((c) => c.role === selectedRole);
    if (credential) {
      login(credential.role, credential.name, credential.email);
      navigate('/dashboard');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-6 h-6" />;
      case 'supervisor':
        return <Eye className="w-6 h-6" />;
      case 'viewer':
        return <Users className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transporter Analytics
          </h1>
          <p className="text-gray-600">Cost & Delivery Dashboard</p>
        </div>

        <div className="card p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a frontend-only authentication simulation. 
              Select a role below to explore the dashboard.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Your Role
          </h2>

          <div className="space-y-3 mb-6">
            {DEMO_CREDENTIALS.map((credential) => (
              <button
                key={credential.role}
                onClick={() => setSelectedRole(credential.role)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRole === credential.role
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${
                    selectedRole === credential.role 
                      ? 'text-primary-600' 
                      : 'text-gray-400'
                  }`}>
                    {getRoleIcon(credential.role)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {credential.role}
                      </span>
                      {selectedRole === credential.role && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {credential.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            className="w-full btn-primary py-3 text-base"
          >
            Continue as {selectedRole}
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            This project uses dummy data for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
