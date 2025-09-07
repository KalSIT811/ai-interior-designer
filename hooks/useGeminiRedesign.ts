import { useState, useCallback, useEffect, useRef } from 'react';
import { redesignRoom } from '../services/geminiService';
import { RedesignResult } from '../types';
import { LOADING_MESSAGES } from '../constants';

type AddToHistoryCallback = (newResult: {
  prompt: string;
  originalImage: string;
  result: RedesignResult;
  designMode: '2d' | '3d';
}) => void;

export const useGeminiRedesign = (addResultToHistory: AddToHistoryCallback) => {
  const [result, setResult] = useState<RedesignResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(LOADING_MESSAGES[0]);
      // Clear any existing interval before setting a new one
      if (intervalRef.current) window.clearInterval(intervalRef.current);

      intervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading]);


  const submitRedesignRequest = useCallback(async (
    imageFile: File,
    prompt: string,
    originalImage: string,
    designMode: '2d' | '3d'
  ) => {
    if (!prompt.trim()) {
      setError('변경사항을 자세히 작성해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const redesignResult = await redesignRoom(imageFile, prompt, designMode);
      setResult(redesignResult);
      addResultToHistory({ prompt, originalImage, result: redesignResult, designMode });
    } catch (err) {
      let errorMessage = "디자인 생성 중 알 수 없는 오류가 발생했습니다.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addResultToHistory]);

  return { result, isLoading, error, loadingMessage, submitRedesignRequest, setResult, setError };
};