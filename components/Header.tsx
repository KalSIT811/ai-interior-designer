
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm animate-fade-in-down">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AI 인테리어 디자이너
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};