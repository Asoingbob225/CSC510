import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ListItemCardProps {
  title: string;
  badges?: ReactNode[];
  details?: { label: string; value: string }[];
  notes?: string;
  bgColor?: string;
  onClick?: () => void;
}

export function ListItemCard({
  title,
  badges = [],
  details = [],
  notes,
  bgColor = 'bg-green-50',
  onClick,
}: ListItemCardProps) {
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
