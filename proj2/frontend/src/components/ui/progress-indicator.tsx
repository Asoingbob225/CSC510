import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ title: string; description?: string }>;
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-colors',
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all',
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
                      'flex-1 h-0.5 transition-colors',
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              <div className="text-xs mt-2 text-center max-w-[100px]">
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
      <div className="text-sm text-gray-500 text-center mt-4">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
