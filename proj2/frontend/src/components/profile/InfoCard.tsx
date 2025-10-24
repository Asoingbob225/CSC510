import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  iconBgColor?: string;
  iconColor?: string;
  children: ReactNode;
  className?: string;
  onEdit?: () => void;
}

export function InfoCard({
  icon: Icon,
  title,
  iconBgColor = 'bg-green-100',
  iconColor = 'text-green-600',
  children,
  className = '',
  onEdit,
}: InfoCardProps) {
  return (
    <div
      className={`group relative rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.08)] ${className}`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-full ${iconBgColor} p-3`}>
          <Icon className={`size-6 ${iconColor}`} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-green-50 hover:text-green-600"
          >
            <Edit3 className="size-4" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
