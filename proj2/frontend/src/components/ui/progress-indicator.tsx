import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ title: string; description?: string }>;
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="mb-2 flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-emerald-500 text-white ring-4 ring-emerald-100',
                    isUpcoming && 'bg-gray-300 text-gray-600'
                  )}
                >
                  {stepNumber}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              <div className="mt-2 max-w-[100px] text-center text-xs">
                <div
                  className={cn(
                    'font-medium',
                    isCurrent && 'text-emerald-600',
                    !isCurrent && 'text-gray-600'
                  )}
                >
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
