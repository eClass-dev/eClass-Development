import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileProcessed: (text: string, fileName:string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, setIsLoading, isLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    const allowedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
    const lastDot = file.name.lastIndexOf('.');
    const fileExtension = lastDot === -1 ? '' : file.name.substring(lastDot).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please select a .pdf, .docx, .pptx, or .txt file.');
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let fullText = '';
      
      if (file.type === 'application/pdf' || fileExtension === '.pdf') {
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
      } else if (file.type === 'text/plain' || fileExtension === '.txt') {
        fullText = new TextDecoder().decode(arrayBuffer);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === '.docx') {
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        fullText = result.value;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileExtension === '.pptx') {
        const pptx = new window.pptx();
        const presentation = await pptx.load(arrayBuffer);
        const slideTexts = await Promise.all(presentation.slides.map((slide: any) => slide.getText()));
        fullText = slideTexts.join('\n\n');
      } else {
        // This is a fallback, though the extension check should catch unsupported types first.
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, PPTX, or TXT file.');
      }

      onFileProcessed(fullText, file.name);

    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process the file. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center">
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 sm:p-12">
        <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Upload Your Document</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Supports PDF, DOCX, PPTX, and TXT files.</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.docx,.pptx"
          className="hidden"
          disabled={isLoading}
        />
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:disabled:bg-emerald-800 dark:disabled:text-slate-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? 'Processing...' : 'Select File'}
        </button>
        {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};