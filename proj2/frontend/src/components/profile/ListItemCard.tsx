import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ListItemCardProps {
  title: string;
  badges?: ReactNode[];
  details?: { label: string; value: string }[];
  notes?: string;
  bgColor?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export function ListItemCard({
  title,
  badges = [],
  details = [],
  notes,
  bgColor = 'bg-green-50',
  onClick,
  variant = 'default',
}: ListItemCardProps) {
  // Compact variant - horizontal layout for simple items
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center justify-between rounded-2xl ${bgColor} px-5 py-4 transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex flex-1 items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span key={index}>{badge}</span>
            ))}
          </div>
        </div>
        <ChevronRight className="size-4 flex-shrink-0 text-gray-400" />
      </div>
    );
  }

  // Detailed variant - emphasis on information
  if (variant === 'detailed') {
    return (
      <div
        className={`rounded-2xl ${bgColor} p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span key={index}>{badge}</span>
              ))}
            </div>
          </div>
          <ChevronRight className="size-5 flex-shrink-0 text-gray-400" />
        </div>

        {details.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {details.map((detail, index) => (
              <div
                key={index}
                className="rounded-lg bg-white/50 px-3 py-2 text-sm backdrop-blur-sm"
              >
                <span className="font-medium text-gray-700">{detail.label}:</span>{' '}
                <span className="text-gray-600">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {notes && (
          <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-gray-700 backdrop-blur-sm">
            {notes}
          </div>
        )}
      </div>
    );
  }

  // Default variant - original layout
  return (
    <div
      className={`flex items-start justify-between rounded-2xl ${bgColor} p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {badges.map((badge, index) => (
            <span key={index}>{badge}</span>
          ))}
        </div>

        {details.length > 0 && (
          <div className="space-y-1">
            {details.map((detail, index) => (
              <div key={index} className="text-sm text-gray-600">
                {detail.label}: {detail.value}
              </div>
            ))}
          </div>
        )}

        {notes && <div className="mt-3 rounded-xl bg-white p-3 text-sm text-gray-700">{notes}</div>}
      </div>
      <ChevronRight className="size-5 flex-shrink-0 text-gray-400" />
    </div>
  );
}
