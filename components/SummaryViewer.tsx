import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SummaryViewerProps {
  summary: string;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({ summary }) => {
  if (!summary) {
    return <p>No summary was generated.</p>;
  }

  // Split summary by newlines to create bullet points, filter empty lines
  const bulletPoints = summary.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="w-full max-w-2xl mx-auto text-left">
      <h3 className="text-2xl font-bold mb-4 text-center">Summary</h3>
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
        <ul className="list-disc list-inside space-y-2">
          {bulletPoints.map((point, index) => (
            <li key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {/* The MarkdownRenderer will wrap this in a <p>, which is fine inside an <li>.
                  We remove the leading hyphen so it doesn't get rendered. */}
              <MarkdownRenderer text={point.replace(/^- \s*/, '')} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};