import React, { useState, useEffect, useCallback } from 'react';
import { STYLE_TIPS, PROMPT_INSPIRATIONS, DESIGN_IDEAS } from '../constants';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
  const [displayedIdeas, setDisplayedIdeas] = useState<string[]>([]);
  const [displayedStyleTips, setDisplayedStyleTips] = useState<{ tip: string; description: string }[]>([]);

  const refreshIdeas = useCallback(() => {
    const shuffled = [...DESIGN_IDEAS].sort(() => 0.5 - Math.random());
    setDisplayedIdeas(shuffled.slice(0, 4));
  }, []);

  const refreshStyleTips = useCallback(() => {
    const shuffled = [...STYLE_TIPS].sort(() => 0.5 - Math.random());
    setDisplayedStyleTips(shuffled.slice(0, 6));
  }, []);

  useEffect(() => {
    refreshIdeas();
    refreshStyleTips();
  }, [refreshIdeas, refreshStyleTips]);


  const handleTipClick = (tip: string) => {
    const newPrompt = value ? `${value.trim()}, ${tip}` : tip;
    onChange(newPrompt);
  };
  
  const handleInspirationClick = () => {
    const randomStyle = PROMPT_INSPIRATIONS.styles[Math.floor(Math.random() * PROMPT_INSPIRATIONS.styles.length)];
    const randomFeature = PROMPT_INSPIRATIONS.features[Math.floor(Math.random() * PROMPT_INSPIRATIONS.features.length)];
    onChange(`${randomStyle}으로 바꿔줘. ${randomFeature}.`);
  };

  return (
    <div className="flex flex-col space-y-3 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">2. 변경사항 작성</h2>
        <button
            onClick={handleInspirationClick}
            disabled={disabled}
            className="text-sm font-medium text-teal-700 hover:text-teal-900 disabled:text-slate-400 transition-colors"
            aria-label="랜덤 프롬프트 생성"
        >
            💡 영감 받기
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="예시) 미드센츄리 모던 스타일로 바꿔줘. 따뜻한 느낌의 조명과 오렌지색 소파를 추가해줘."
        className="w-full flex-grow p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
        rows={6}
      />
      <div className="pt-2 space-y-4">
        <div>
           <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-700">✨ 스타일 키워드</h3>
            <button
              type="button"
              onClick={refreshStyleTips}
              disabled={disabled}
              className="p-1.5 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-800 disabled:text-slate-400 disabled:bg-transparent transition-colors"
              aria-label="새로운 스타일 키워드 보기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667-11.667a8.25 8.25 0 00-11.667 0l-3.181 3.183m11.667-3.183L16.5 7.5m0 0l-3.181 3.183m3.181-3.183L6.002 7.5" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayedStyleTips.map(({tip, description}, index) => (
              <button
                key={tip}
                onClick={() => handleTipClick(tip)}
                disabled={disabled}
                className="opacity-0 animate-stagger-in px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-teal-100 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-150 ease-out hover:scale-105 active:scale-95"
                aria-label={`프롬프트에 ${tip} 추가`}
                title={description}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-700">💡 인테리어 아이디어</h3>
            <button
              type="button"
              onClick={refreshIdeas}
              disabled={disabled}
              className="p-1.5 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-800 disabled:text-slate-400 disabled:bg-transparent transition-colors"
              aria-label="새로운 아이디어 보기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667-11.667a8.25 8.25 0 00-11.667 0l-3.181 3.183m11.667-3.183L16.5 7.5m0 0l-3.181 3.183m3.181-3.183L6.002 7.5" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {displayedIdeas.map((idea, index) => (
              <button
                key={idea}
                onClick={() => handleTipClick(idea)}
                disabled={disabled}
                className="opacity-0 animate-stagger-in w-full text-left px-3 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-100"
                aria-label={`프롬프트에 ${idea} 추가`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};