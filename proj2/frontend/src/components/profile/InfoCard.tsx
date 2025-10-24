import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  iconBgColor?: string;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

export function InfoCard({
  icon: Icon,
  title,
  iconBgColor = 'bg-green-100',
  iconColor = 'text-green-600',
  children,
  className = '',
}: InfoCardProps) {
  return (
    <div className={`rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.08)] ${className}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-full ${iconBgColor} p-3`}>
          <Icon className={`size-6 ${iconColor}`} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
