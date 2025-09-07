import { useState, useCallback } from 'react';
import { analyzeRoom } from '../services/geminiService';
import { RoomAnalysis } from '../types';

export const useGeminiAnalysis = () => {
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const submitAnalysisRequest = useCallback(async (imageFile: File) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const analysisResult = await analyzeRoom(imageFile);
      setAnalysis(analysisResult);
    } catch (err) {
      setAnalysisError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);
  
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  }, []);

  return { analysis, isAnalyzing, analysisError, submitAnalysisRequest, clearAnalysis };
};