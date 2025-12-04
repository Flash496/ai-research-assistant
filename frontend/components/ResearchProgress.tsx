'use client';

import { ProgressUpdate } from '@/hooks/useWebSocket';

export interface ResearchProgressProps {
  progress: ProgressUpdate | null;
  isComplete: boolean;
  error: string | null;
}

export function ResearchProgress({ progress, isComplete, error }: ResearchProgressProps) {
  const steps = [
    { id: 'planning', label: 'Planning', icon: '📋' },
    { id: 'searching', label: 'Searching', icon: '🔍' },
    { id: 'analyzing', label: 'Analyzing', icon: '📊' },
    { id: 'generating', label: 'Generating', icon: '✍️' },
  ];

  const currentStepIndex = progress ? steps.findIndex(s => s.id === progress.step) : -1;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-700 mb-2">Research Failed</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-700">Research Complete!</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <span className="text-2xl">{step.icon}</span>
            <div className="flex-1">
              <p className={`font-medium ${
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
              {index === currentStepIndex && progress && (
                <p className="text-sm text-gray-600">{progress.message}</p>
              )}
            </div>
            {index < currentStepIndex && (
              <span className="text-green-600 font-bold">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}