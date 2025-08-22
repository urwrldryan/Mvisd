import React, { useState, useEffect } from 'react';

interface PreviewModalProps {
    url: string;
    onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ url, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Reset loading state when URL changes
        setIsLoading(true);
    }, [url]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            aria-labelledby="preview-modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 id="preview-modal-title" className="text-lg font-semibold text-slate-100 truncate">
                        Interactive Preview: <span className="text-indigo-400 font-normal">{url}</span>
                    </h2>
                    <div className="flex items-center gap-4">
                         <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                        >
                            Open in New Tab
                        </a>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full text-slate-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Close preview"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="bg-gray-900 flex-grow flex flex-col">
                     <div className="p-2 bg-yellow-900/50 text-yellow-200 text-xs text-center flex-shrink-0 border-b border-yellow-800/50">
                        <p><strong>Note:</strong> Some websites may not load in this preview due to their security policies. Use the "Open in New Tab" button if the content doesn't appear.</p>
                    </div>
                    <div className="relative flex-grow">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-gray-900 z-20">
                                <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading interactive preview...</span>
                            </div>
                        )}
                        <iframe
                            src={url}
                            title={`Interactive preview of ${url}`}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-forms allow-same-origin"
                            onLoad={() => setIsLoading(false)}
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;