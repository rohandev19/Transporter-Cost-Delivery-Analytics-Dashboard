interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {spinner}
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
