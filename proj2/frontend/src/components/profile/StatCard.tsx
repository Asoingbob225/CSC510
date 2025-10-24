import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  bgColor?: string;
}

export function StatCard({ label, value, unit, icon, bgColor = 'bg-green-50' }: StatCardProps) {
  return (
    <div className={`rounded-2xl ${bgColor} p-6 shadow-[inset_0_2px_8px_rgb(0,0,0,0.04)]`}>
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-semibold text-gray-800">
        {value}
        {unit && <span className="ml-1 text-lg text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
