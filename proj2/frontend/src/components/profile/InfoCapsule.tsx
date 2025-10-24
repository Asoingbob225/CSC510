import type { ReactNode } from 'react';

interface InfoCapsuleProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'accent';
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-green-100 text-green-700',
  accent: 'bg-blue-100 text-blue-700',
};

export function InfoCapsule({ icon, label, value, variant = 'default' }: InfoCapsuleProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 ${variantStyles[variant]} shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium opacity-75">{label}:</span>
        <span className="text-base font-semibold">{value}</span>
      </div>
    </div>
  );
}
