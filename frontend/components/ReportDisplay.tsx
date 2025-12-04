'use client';

import ReactMarkdown from 'react-markdown';

interface ReportDisplayProps {
  report: string | null;
  loading: boolean;
}

export function ReportDisplay({ report, loading }: ReportDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
        <div className="animate-spin text-2xl">⏳</div>
        <p className="ml-3 text-gray-600">Generating report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No report available yet.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border border-gray-200">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-6 border-b pb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {report}
      </ReactMarkdown>
    </div>
  );
}