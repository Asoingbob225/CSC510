import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AllergySeverity } from '@/lib/api';

interface AllergySeverityWarningProps {
  severity: AllergySeverity;
  allergenName?: string;
  className?: string;
}

/**
 * Component to display visual warnings based on allergy severity
 * Uses different colors and animations for different severity levels
 */
function AllergySeverityWarning({
  severity,
  allergenName,
  className,
}: AllergySeverityWarningProps) {
  const getSeverityStyles = (level: AllergySeverity) => {
    switch (level) {
      case 'life_threatening':
        return 'bg-red-600 text-white animate-pulse border-red-700';
      case 'severe':
        return 'bg-red-500 text-white border-red-600';
      case 'moderate':
        return 'bg-orange-500 text-white border-orange-600';
      case 'mild':
        return 'bg-yellow-400 text-gray-900 border-yellow-500';
      default:
        return 'bg-gray-200 text-gray-900 border-gray-300';
    }
  };

  const getSeverityLabel = (level: AllergySeverity) => {
    switch (level) {
      case 'life_threatening':
        return 'LIFE THREATENING';
      case 'severe':
        return 'SEVERE';
      case 'moderate':
        return 'MODERATE';
      case 'mild':
        return 'MILD';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-semibold',
        getSeverityStyles(severity),
        className
      )}
      role="alert"
      aria-live={severity === 'life_threatening' || severity === 'severe' ? 'assertive' : 'polite'}
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span>
        {allergenName ? `${allergenName}: ` : ''}
        {getSeverityLabel(severity)}
      </span>
    </div>
  );
}

export default AllergySeverityWarning;
