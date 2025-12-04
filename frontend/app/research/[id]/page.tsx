'use client';

import { useState, useEffect } from 'react';
import { useResearch } from '@/hooks/useWebSocket';
import { ResearchProgress } from '@/components/ResearchProgress';
import { ReportDisplay } from '@/components/ReportDisplay';

export default function ResearchPage({ params }: { params: { id: string } }) {
  const { task, loading, progress, report, error } = useResearch(params.id);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (report) {
      setIsComplete(true);
    }
  }, [report]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {task?.query || 'Loading...'}
          </h1>
          <p className="text-gray-600">Research ID: {params.id}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4">Progress</h2>
              <ResearchProgress
                progress={progress}
                isComplete={isComplete}
                error={error}
              />
            </div>
          </div>

          {/* Report Column */}
          <div className="lg:col-span-2">
            {isComplete ? (
              <>
                <ReportDisplay report={report} loading={false} />
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => {
                        if (!report) return;
                      const element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
                      element.setAttribute('download', `research-${params.id}.md`);
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download Report
                  </button>
                  <a
                    href="/"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    New Research
                  </a>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600 mb-4">Research in progress...</p>
                <div className="inline-block animate-spin text-4xl">⏳</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}