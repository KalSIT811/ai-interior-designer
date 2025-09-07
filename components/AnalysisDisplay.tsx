import React, { useState } from 'react';
import { RoomAnalysis } from '../types';

interface AnalysisDisplayProps {
  isAnalyzing: boolean;
  analysis: RoomAnalysis | null;
  error: string | null;
  onApplySuggestion: (suggestion: string) => void;
  disabled: boolean;
  highlightedSuggestion: string | null;
  onHighlight: (suggestion: string | null) => void;
}

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-slate-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-3 text-left font-semibold text-slate-700 hover:bg-slate-100/80 px-2 rounded-md transition-colors"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transform transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="pb-3 px-2 text-slate-600 space-y-2 animate-slide-down">
                    {children}
                </div>
            )}
        </div>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
    isAnalyzing, 
    analysis, 
    error, 
    onApplySuggestion, 
    disabled,
    highlightedSuggestion,
    onHighlight
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center space-x-3 text-slate-600 animate-fade-in">
        <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>AI가 공간을 분석하고 있어요...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl animate-fade-in" role="alert">
        <strong className="font-bold">분석 오류: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-3 px-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L14.25 14.5M9.75 3.104a2.25 2.25 0 00-1.5 2.122v5.714a2.25 2.25 0 00.659 1.591L9.5 14.5m4.75-6.896l4.25 4.25m-4.25-4.25a2.25 2.25 0 013.182 0l4.25 4.25a2.25 2.25 0 010 3.182l-4.25 4.25a2.25 2.25 0 01-3.182 0l-4.25-4.25a2.25 2.25 0 010-3.182l4.25-4.25a2.25 2.25 0 013.182 0z" />
          </svg>
          <h2 className="text-lg font-bold text-slate-800">AI 룸 분석 및 제안</h2>
        </div>

        <div className="space-y-1">
             <AccordionSection title="현재 공간 분석" defaultOpen={true}>
                <div className="text-sm space-y-2">
                    <p><strong>스타일:</strong> {analysis.currentSpace.style}</p>
                    <div>
                        <strong className="text-green-700">장점:</strong>
                        <ul className="list-disc list-inside ml-2">
                            {analysis.currentSpace.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                        </ul>
                    </div>
                    <div>
                        <strong className="text-amber-700">개선점:</strong>
                        <ul className="list-disc list-inside ml-2">
                            {analysis.currentSpace.cons.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                    </div>
                </div>
            </AccordionSection>
            
            <AccordionSection title="구체적인 개선 제안" defaultOpen={true}>
                <div className="space-y-2">
                {analysis.improvementSuggestions.map((suggestionItem, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center justify-between p-2 rounded-md group transition-all duration-200 ${highlightedSuggestion === suggestionItem.suggestion ? 'bg-teal-100/50' : 'hover:bg-slate-100/80 hover:scale-[1.02]'}`}
                        onMouseEnter={() => onHighlight(suggestionItem.suggestion)}
                        onMouseLeave={() => onHighlight(null)}
                    >
                        <span className="text-sm text-slate-800 pr-2 flex items-center gap-2">
                          {suggestionItem.boundingBox && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {suggestionItem.suggestion}
                        </span>
                        <button
                            onClick={() => onApplySuggestion(suggestionItem.suggestion)}
                            disabled={disabled}
                            className="flex-shrink-0 p-1.5 bg-white border border-slate-300 rounded-full text-slate-500 hover:bg-teal-100 hover:text-teal-700 hover:border-teal-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-100"
                            aria-label={`'${suggestionItem.suggestion}' 프롬프트에 추가`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                ))}
                </div>
            </AccordionSection>
            
            <AccordionSection title="새로운 스타일 추천">
                <div className="space-y-2">
                {analysis.newStyleRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100/80 group transition-all duration-200 hover:scale-[1.02]">
                        <div className="pr-2">
                            <p className="text-sm font-semibold text-slate-800">{rec.name}</p>
                            <p className="text-xs text-slate-500">{rec.description}</p>
                        </div>
                         <button
                            onClick={() => onApplySuggestion(`${rec.name} 스타일로`)}
                            disabled={disabled}
                            className="flex-shrink-0 p-1.5 bg-white border border-slate-300 rounded-full text-slate-500 hover:bg-teal-100 hover:text-teal-700 hover:border-teal-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-100"
                            aria-label={`'${rec.name} 스타일로' 프롬프트에 추가`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                ))}
                </div>
            </AccordionSection>
        </div>
    </div>
  );
};