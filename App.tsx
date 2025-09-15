import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Welcome } from './components/Welcome';
import { HistoryPanel } from './components/HistoryPanel';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useGeminiRedesign } from './hooks/useGeminiRedesign';
import { useGeminiAnalysis } from './hooks/useGeminiAnalysis';
import { HistoryItem, RedesignResult } from './types';
import { Loader } from './components/Loader';
import { NavigationDrawer } from './components/NavigationDrawer';
import { Snackbar } from './components/Snackbar';
import { SegmentedButton } from './components/SegmentedButton';

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};


const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error("데이터 URL을 파일로 변환하는 중 오류 발생:", error);
    return null;
  }
};

type AppView = 'landing' | 'designer';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['이미지 업로드', 'AI 분석', '변경사항 입력', '결과 확인'];
    return (
        <nav aria-label="디자인 진행 단계" className="w-full max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in">
            <ol className="flex items-start">
                {steps.map((step, index) => (
                    <li key={step} className={`flex-1 ${index < steps.length - 1 ? 'pr-4' : ''} relative`}>
                        <div className="flex flex-col items-center text-center w-full">
                           <div className="flex flex-col items-center">
                             <span className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                currentStep >= index ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                            } transition-colors duration-300`}>
                                {currentStep > index ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : index + 1}
                            </span>
                             <span className={`mt-2 text-xs sm:text-sm font-medium ${
                                currentStep >= index ? 'text-primary' : 'text-slate-500'
                            }`}>{step}</span>
                           </div>
                        </div>
                        {index < steps.length - 1 && (
                             <div className="absolute top-5 h-0.5 bg-slate-200" style={{ zIndex: -1, left: 'calc(50% + 24px)', right: 'calc(-50% + 24px)' }}>
                                <div className={`h-full bg-primary transition-all duration-500 ${currentStep > index ? 'w-full' : 'w-0'}`} />
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};


const App: React.FC = () => {
  const [appView, setAppView] = useState<AppView>('landing');
  const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Analyze, 2: Prompt, 3: Result
  const [prompt, setPrompt] = useState<string>('');
  const [designMode, setDesignMode] = useState<'2d' | '3d'>('2d');
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; key: number } | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const showSnackbar = (message: string) => {
    setSnackbar({ message, key: Date.now() });
  };

  const {
    imageFile,
    imagePreview,
    handleImageUpload,
    setImageFile,
    setImagePreview
  } = useImageProcessor();

  const {
    analysis,
    isAnalyzing,
    analysisError,
    submitAnalysisRequest,
    clearAnalysis
  } = useGeminiAnalysis();

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('designHistory');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => 
          item && typeof item === 'object' && item.result && typeof item.result.image === 'string' && item.result.image.startsWith('data:image') && typeof item.originalImage === 'string'
        );
      }
      return [];
    } catch (error) {
      console.error("히스토리 로딩 실패:", error);
      return [];
    }
  });

  const addResultToHistory = useCallback((newResult: { prompt: string; originalImage: string; result: RedesignResult; designMode: '2d' | '3d' }) => {
    const newItem: HistoryItem = {
      id: new Date().toISOString(),
      ...newResult,
    };
    setHistory(prev => [newItem, ...prev.slice(0, 9)]);
  }, []);

  const {
    result,
    isLoading,
    error,
    loadingMessage,
    submitRedesignRequest,
    setResult,
    setError
  } = useGeminiRedesign(addResultToHistory);

  useEffect(() => {
    localStorage.setItem('designHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (currentStep === 3 && !isLoading && result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      resultRef.current.focus();
    }
  }, [currentStep, isLoading, result]);

  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
  }, []);

  const handleApplySuggestion = useCallback((suggestion: string) => {
    setPrompt(prev => {
        const isApplied = prev.includes(suggestion);

        if (isApplied) {
            // Try to remove with preceding period/space, then standalone.
            let newPrompt = prev.replace(`. ${suggestion}`, '');
            if (newPrompt === prev) { // if the first replacement did nothing
                newPrompt = newPrompt.replace(suggestion, '');
            }
            // Tidy up: remove leading/trailing spaces, fix double periods.
            return newPrompt.replace(/\s\s+/g, ' ').replace('..', '.').trim();
        } else {
            // Add the suggestion
            let newPrompt = prev.trim();
            if (newPrompt === '') {
                return suggestion;
            }
            if (!/[.!?]$/.test(newPrompt)) {
                newPrompt += '.';
            }
            return `${newPrompt} ${suggestion}`;
        }
    });
  }, []);

  const handleHighlightSuggestion = useCallback((suggestion: string | null) => {
    setHighlightedSuggestion(suggestion);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setResult(null);
    setError(null);
    clearAnalysis();
    setHighlightedSuggestion(null);

    const processedFile = await handleImageUpload(file);
    if (processedFile) {
        submitAnalysisRequest(processedFile);
        setCurrentStep(1);
    }
  }, [handleImageUpload, submitAnalysisRequest, setResult, setError, clearAnalysis]);

  const handleSubmit = () => {
    if (!imageFile || !imagePreview) {
      setError('먼저 방 사진을 업로드해주세요.');
      return;
    }
    submitRedesignRequest(imageFile, prompt, imagePreview, designMode);
    setCurrentStep(3);
  };
  
  const resetState = () => {
    setResult(null);
    setError(null);
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
    setDesignMode('2d');
    clearAnalysis();
    setHighlightedSuggestion(null);
  };

  const handleSelectHistory = useCallback(async (item: HistoryItem) => {
    resetState();
    setAppView('designer');
    setCurrentStep(3);

    setPrompt(item.prompt);
    setImagePreview(item.originalImage);
    setResult(item.result);
    setDesignMode(item.designMode);
    
    const historicFile = await dataUrlToFile(item.originalImage, 'history-image.png');
    if (historicFile) {
        setImageFile(historicFile);
    } else {
        setImageFile(null);
        setError("히스토리 이미지 로딩에 실패하여 다시 생성할 수 없습니다.");
    }

    window.scrollTo(0, 0);
    setSrAnnouncement('히스토리 항목이 로드되었습니다.');
  }, [setImageFile, setImagePreview, setResult, setError, clearAnalysis]);
  
  const handleStart = () => {
    setAppView('designer');
    setCurrentStep(0);
  }

  const handleNewDesign = () => {
      resetState();
      setCurrentStep(0);
      setAppView('designer');
  };
  
  const handleContinueDesign = useCallback(async () => {
    if (!result?.image) return;

    const newFile = await dataUrlToFile(result.image, `redesigned-${new Date().getTime()}.png`);
    if (!newFile) {
        setError("디자인을 이어가기 위해 이미지를 준비하는 데 실패했습니다.");
        return;
    }
    
    setError(null);
    setPrompt('');
    
    setImageFile(newFile);
    setImagePreview(result.image);
    
    setResult(null);
    clearAnalysis();
    setHighlightedSuggestion(null);

    submitAnalysisRequest(newFile);
    setCurrentStep(1);
    
    window.scrollTo(0, 0);
    setSrAnnouncement('이전 결과 이미지를 바탕으로 새로운 디자인을 시작합니다.');
  }, [result, clearAnalysis, submitAnalysisRequest, setImageFile, setImagePreview, setPrompt, setError]);

  const handleGoToLanding = () => {
      resetState();
      setAppView('landing');
  }
  
  const isButtonDisabled = !imageFile || !prompt.trim() || isLoading;
  const steps = ['이미지 업로드', 'AI 분석', '변경사항 입력', '결과 확인'];

  const renderDesignerContent = () => {
    const commonLeftColumn = (
        <div className="flex flex-col gap-6 animate-fade-in lg:sticky lg:top-24">
           <ImageUploader 
              isReadOnly
              imagePreviewUrl={imagePreview}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              highlightedSuggestion={highlightedSuggestion}
              onHighlight={handleHighlightSuggestion}
            />
        </div>
    );
    
    switch (currentStep) {
        case 0: // Upload
            return (
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <ImageUploader 
                      onImageUpload={handleFileUpload} 
                      imagePreviewUrl={imagePreview}
                    />
                </div>
            );
        case 1: // Analyze
        case 2: // Prompt
            const rightColumnContent = currentStep === 1 ? (
                 <div className="flex flex-col h-full animate-fade-in">
                   <div className="flex-grow">
                      <AnalysisDisplay 
                        isAnalyzing={isAnalyzing}
                        analysis={analysis}
                        error={analysisError}
                        onApplySuggestion={handleApplySuggestion}
                        prompt={prompt}
                        disabled={isLoading}
                        highlightedSuggestion={highlightedSuggestion}
                        onHighlight={handleHighlightSuggestion}
                      />
                   </div>
                   <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isAnalyzing || !analysis}
                      className="mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg shadow-accent/20 text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-1"
                   >
                      다음 단계로
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                   </button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                  <PromptInput
                    value={prompt}
                    onChange={handlePromptChange}
                    disabled={isLoading}
                  />
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-3">디자인 뷰 선택</h3>
                     <SegmentedButton
                        options={[
                            { label: '2D 리디자인', value: '2d' },
                            { label: '3D 뷰 제안', value: '3d' },
                        ]}
                        value={designMode}
                        onChange={(val) => setDesignMode(val as '2d' | '3d')}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg shadow-primary/20 text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-1"
                  >
                    {isLoading ? loadingMessage : '✨ 디자인 생성하기'}
                  </button>
                </div>
            );

            return isDesktop ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 xl:gap-16">
                    {commonLeftColumn}
                    <div className="flex flex-col">
                        {rightColumnContent}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {commonLeftColumn}
                    {rightColumnContent}
                </div>
            );
        case 3: // Result
            return (
                 <>
                    {isLoading && (
                       <div className="text-center p-12 bg-surface rounded-2xl shadow-xl animate-fade-in">
                          <div className="flex justify-center items-center mb-4">
                            <Loader/>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">{loadingMessage}</h3>
                          <p className="text-slate-500 mt-1">AI가 당신의 공간을 재창조하고 있습니다...</p>
                       </div>
                    )}
                    {error && (
                      <div className="bg-red-100/50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
                        <strong className="font-bold">오류 발생: </strong>
                        <span className="block sm:inline">{error}</span>
                      </div>
                    )}
                    {!isLoading && result?.image && imagePreview && (
                      <div ref={resultRef} tabIndex={-1} className="focus:outline-none animate-slide-up-fade">
                        <ResultDisplay
                          originalImage={imagePreview}
                          redesignedImage={result.image}
                          description={result.text || ''}
                          colorPalette={result.colorPalette}
                          onNewDesign={handleNewDesign}
                          onContinueDesign={handleContinueDesign}
                          showSnackbar={showSnackbar}
                        />
                      </div>
                    )}
                 </>
            );
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className="flex flex-col flex-1 min-h-screen">
        <Header 
          onLogoClick={handleGoToLanding} 
          onMenuClick={() => setIsDrawerOpen(true)}
          currentStep={currentStep}
          steps={appView === 'designer' ? steps : []}
        />
        <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          {appView === 'landing' && <Welcome onStart={handleStart} />}
          
          {appView === 'designer' && (
             <div className="max-w-6xl mx-auto">
                <Stepper currentStep={currentStep} />
                
                <div className="mt-10">
                  {renderDesignerContent()}
                </div>

                {history.length > 0 && appView === 'designer' && currentStep !== 0 && (
                  <HistoryPanel history={history} onSelect={handleSelectHistory} />
                )}
              </div>
          )}
        </main>
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {srAnnouncement}
      </div>
       {snackbar && (
        <Snackbar
          key={snackbar.key}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default App;