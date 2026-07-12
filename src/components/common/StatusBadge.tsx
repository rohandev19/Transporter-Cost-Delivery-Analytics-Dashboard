import { TransporterRecordStatus } from '../../types/transporter';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: TransporterRecordStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const config = {
    valid: {
      label: 'Valid',
      className: 'bg-green-100 text-green-700 border border-green-200',
      Icon: CheckCircle,
    },
    warning: {
      label: 'Warning',
      className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      Icon: AlertCircle,
    },
    anomaly: {
      label: 'Anomaly',
      className: 'bg-red-100 text-red-700 border border-red-200',
      Icon: AlertTriangle,
    },
  };

  const { label, className, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${className} ${sizeClasses[size]}`}
    >
      <Icon className={iconSize[size]} />
      {label}
    </span>
  );
}
