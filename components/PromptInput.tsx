import React, { useState, useEffect, useCallback } from 'react';
import { STYLE_TIPS, PROMPT_INSPIRATIONS, DESIGN_IDEAS, MAX_PROMPT_LENGTH, AUTO_SUGGEST_TERMS } from '../constants';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
  const [displayedIdeas, setDisplayedIdeas] = useState<string[]>([]);
  const [displayedStyleTips, setDisplayedStyleTips] = useState<{ tip: string; description: string }[]>([]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

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
  
  const handleSuggestionClick = useCallback((suggestion: string) => {
    const lastTokenMatch = value.match(/([^\s,]+)$/);
    if (lastTokenMatch) {
      const lastToken = lastTokenMatch[0];
      const prefix = value.substring(0, value.length - lastToken.length);
      onChange(prefix + suggestion);
    } else {
      onChange(value + suggestion);
    }
    setIsSuggestionsVisible(false);
  }, [value, onChange]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const lastTokenMatch = newValue.match(/([^\s,]+)$/);
    const lastWord = lastTokenMatch ? lastTokenMatch[1] : '';

    if (lastWord.length > 0) {
        const filtered = AUTO_SUGGEST_TERMS.filter(term => 
            term.toLowerCase().startsWith(lastWord.toLowerCase()) && term.toLowerCase() !== lastWord.toLowerCase()
        );
        setSuggestions(filtered);
        setIsSuggestionsVisible(filtered.length > 0);
        setActiveSuggestionIndex(0);
    } else {
        setIsSuggestionsVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSuggestionsVisible && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsSuggestionsVisible(false);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-3 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">3. 변경사항 입력</h2>
        <button
            onClick={handleInspirationClick}
            disabled={disabled}
            className="text-sm font-medium text-primary hover:text-primary-dark disabled:text-slate-400 transition-colors"
            aria-label="랜덤 프롬프트 생성"
        >
            💡 영감 받기
        </button>
      </div>
      <div className="relative w-full">
        <textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 150)}
            disabled={disabled}
            placeholder="예시) 미드센츄리 모던 스타일로 바꿔줘. 따뜻한 느낌의 조명과 오렌지색 소파를 추가해줘."
            className="w-full p-4 pr-16 border border-slate-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
            rows={6}
            maxLength={MAX_PROMPT_LENGTH}
            aria-autocomplete="list"
            aria-controls="suggestion-list"
            aria-expanded={isSuggestionsVisible && suggestions.length > 0}
        />
        <button
            type="button"
            disabled={disabled}
            className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full shadow hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-110"
            aria-label="음성으로 입력하기"
            title="음성으로 입력하기 (준비 중)"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </button>
        {isSuggestionsVisible && suggestions.length > 0 && (
          <div 
            id="suggestion-list"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto animate-fade-in-down"
          >
            <ul>
              {suggestions.map((s, index) => (
                <li key={s} role="option" aria-selected={index === activeSuggestionIndex}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      index === activeSuggestionIndex ? 'bg-accent-dark text-primary-dark' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => handleSuggestionClick(s)}
                    onMouseDown={(e) => e.preventDefault()} // Prevents textarea blur before click
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-slate-500 px-1 -mt-1.5">
          <span className="transition-opacity text-primary font-medium h-4">
              {isSuggestionsVisible && suggestions.length > 0 ? '↑↓로 선택, Enter 또는 Tab으로 입력' : ''}
          </span>
          <span className={`font-medium ${value.length >= MAX_PROMPT_LENGTH ? 'text-red-500' : 'text-slate-600'}`}>
              {value.length}/{MAX_PROMPT_LENGTH}
          </span>
      </div>
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
                className="opacity-0 animate-stagger-in px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200/80 font-medium rounded-full text-xs hover:bg-teal-100 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-150 ease-out hover:scale-105 active:scale-95"
                aria-label={`프롬프트에 ${tip} 추가`}
                title={description}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};