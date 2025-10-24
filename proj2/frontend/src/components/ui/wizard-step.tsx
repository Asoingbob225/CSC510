import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WizardStepProps {
  isActive: boolean;
  children: ReactNode;
  className?: string;
}

export function WizardStep({ isActive, children, className }: WizardStepProps) {
  if (!isActive) return null;

  return (
    <div className={cn('animate-in duration-300 fade-in-50 slide-in-from-right-5', className)}>
      {children}
    </div>
  );
}
