import React from 'react';

interface HeaderProps {
    onLogoClick: () => void;
    onMenuClick: () => void;
    currentStep: number;
    steps: string[];
}

const Breadcrumbs: React.FC<{ steps: string[], currentStep: number }> = ({ steps, currentStep }) => {
    if (steps.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-sm font-medium text-slate-500">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <span className={index === currentStep ? 'text-primary font-semibold' : ''}>{step}</span>
                    {index < steps.length - 1 && (
                        <svg className="w-4 h-4 mx-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export const Header: React.FC<HeaderProps> = ({ onLogoClick, onMenuClick, currentStep, steps }) => {
  return (
    <header className="bg-surface/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 animate-fade-in-down">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
             <button onClick={onMenuClick} className="p-2 -ml-2 rounded-full text-slate-600 hover:bg-slate-200 lg:hidden" aria-label="메뉴 열기">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <button onClick={onLogoClick} className="flex items-center space-x-3 group" aria-label="홈으로 이동">
               <div className="h-9 w-9 bg-primary group-hover:bg-primary-light rounded-lg flex items-center justify-center transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
               </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight hidden sm:block">
                AI 인테리어 디자이너
              </h1>
            </button>
          </div>
          
          <div className="flex items-center">
            <Breadcrumbs steps={steps} currentStep={currentStep} />
          </div>

        </div>
      </div>
    </header>
  );
};
