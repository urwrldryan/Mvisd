import React, { useState } from 'react';
import { AlertMessage } from '../types';

interface MainTabProps {
  onUpload: (url: string) => void;
  setAlert: (alert: AlertMessage | null) => void;
}

const UploadIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3.75 12h16.5c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v4.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);


const MainTab: React.FC<MainTabProps> = ({ onUpload, setAlert }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
        setAlert({ message: 'Please enter a URL.', type: 'error' });
        return;
    }
    
    let processedUrl = url.trim();
    if (processedUrl && !/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        onUpload(processedUrl);
        setUrl('');
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100">Submit a New Link</h2>
        <p className="mt-2 text-slate-400">Share a valuable resource with the community. Your submission will be reviewed by an admin.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
            File URL or Link
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com/resource"
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-slate-100 placeholder:text-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
          >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
                </>
            ) : (
                <>
                <UploadIcon className="w-5 h-5"/>
                Submit for Review
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MainTab;