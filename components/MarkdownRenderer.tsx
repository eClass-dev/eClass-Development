import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  if (!text) return null;

  // First, remove any heading symbols or other unwanted markdown
  let cleanedText = text.replace(/^(#+\s*)/gm, '');

  const parts = cleanedText.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);

  const renderedParts = parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });

  return <p>{renderedParts}</p>;
};