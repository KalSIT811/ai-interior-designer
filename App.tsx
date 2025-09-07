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

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [designMode, setDesignMode] = useState<'2d' | '3d'>('2d');
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

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
      return saved ? JSON.parse(saved) : [];
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
    setHistory(prev => [newItem, ...prev.slice(0, 4)]);
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
    if (!isLoading && result && resultRef.current) {
      resultRef.current.focus();
    }
  }, [isLoading, result]);

  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
  }, []);

  const handleApplySuggestion = useCallback((suggestion: string) => {
    setPrompt(prev => {
        if (!prev.trim()) return suggestion;
        if (prev.includes(suggestion)) return prev;
        return `${prev.trim()}, ${suggestion}`;
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
    }
  }, [handleImageUpload, submitAnalysisRequest, setResult, setError, clearAnalysis]);

  const handleSubmit = () => {
    if (!imageFile || !imagePreview) {
      setError('먼저 방 사진을 업로드해주세요.');
      return;
    }
    submitRedesignRequest(imageFile, prompt, imagePreview, designMode);
  };

  const handleSelectHistory = useCallback(async (item: HistoryItem) => {
    setPrompt(item.prompt);
    setImagePreview(item.originalImage);
    setResult(item.result);
    setDesignMode(item.designMode);
    clearAnalysis();
    setHighlightedSuggestion(null);
    setError(null);
    
    const historicFile = await dataUrlToFile(item.originalImage, 'history-image.png');
    if (historicFile) {
        setImageFile(historicFile);
    } else {
        setImageFile(null); // Keep it disabled if conversion fails
        setError("히스토리 이미지 로딩에 실패하여 다시 생성할 수 없습니다.");
    }

    window.scrollTo(0, 0);
    setSrAnnouncement('히스토리 항목이 로드되었습니다.');
  }, [setImageFile, setImagePreview, setResult, setError, clearAnalysis]);

  const handleNewDesign = () => {
      setResult(null);
      setError(null);
      setPrompt('');
      setImageFile(null);
      setImagePreview(null);
      setDesignMode('2d');
      clearAnalysis();
      setHighlightedSuggestion(null);
  };
  
  const isButtonDisabled = !imageFile || !prompt.trim() || isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-slide-up-fade">
                <ImageUploader 
                  onImageUpload={handleFileUpload} 
                  imagePreviewUrl={imagePreview}
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  highlightedSuggestion={highlightedSuggestion}
                  onHighlight={handleHighlightSuggestion}
                />
              </div>
              <div className="flex flex-col space-y-6 animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
                {(isAnalyzing || analysis || analysisError) && !result && (
                  <AnalysisDisplay 
                    isAnalyzing={isAnalyzing}
                    analysis={analysis}
                    error={analysisError}
                    onApplySuggestion={handleApplySuggestion}
                    disabled={isLoading}
                    highlightedSuggestion={highlightedSuggestion}
                    onHighlight={handleHighlightSuggestion}
                  />
                )}
                <PromptInput
                  value={prompt}
                  onChange={handlePromptChange}
                  disabled={isLoading}
                />
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-3">디자인 뷰 선택</h3>
                  <div className="relative flex w-full p-1 bg-slate-200/50 rounded-lg border border-slate-300/80">
                    <div
                      className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-md shadow-md transition-transform duration-300 ease-in-out"
                      style={{ transform: designMode === '2d' ? 'translateX(0%)' : 'translateX(100%)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setDesignMode('2d')}
                      className={`relative w-1/2 px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-teal-600 rounded-md ${
                        designMode === '2d' ? 'text-teal-700' : 'text-slate-700 hover:text-slate-900'
                      }`}
                      aria-pressed={designMode === '2d'}
                    >
                      2D 리디자인
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignMode('3d')}
                      className={`relative w-1/2 px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-teal-600 rounded-md ${
                        designMode === '3d' ? 'text-teal-700' : 'text-slate-700 hover:text-slate-900'
                      }`}
                      aria-pressed={designMode === '3d'}
                    >
                      3D 뷰 제안
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 px-1">
                    {designMode === '2d' ? '현재 구도를 유지하며 디자인을 변경합니다.' : '기존 구도를 사실적인 3D 렌더링 스타일로 재구성합니다.'}
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isButtonDisabled}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg shadow-teal-700/20 text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-1"
                >
                  {isLoading ? loadingMessage : '✨ 디자인 생성하기'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
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
                />
              </div>
            )}
            {!result && !isLoading && !imagePreview && <Welcome />}
          </div>

          {history.length > 0 && (
            <HistoryPanel history={history} onSelect={handleSelectHistory} />
          )}
        </div>
      </main>
      <div role="status" aria-live="polite" className="sr-only">
        {srAnnouncement}
      </div>
    </div>
  );
};

export default App;