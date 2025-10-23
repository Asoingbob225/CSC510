import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className={cn('group relative inline-block', className)}>
      {children || <HelpCircle className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />}
      <div className="pointer-events-none invisible absolute top-full -left-28 z-10 mt-2 w-64 rounded-lg bg-gray-900 p-2 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
        {content}
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900" />
      </div>
    </div>
  );
}
