
import React, { useRef, useCallback, useState } from 'react';
import { RoomAnalysis } from '../types';
import { ImageAnalysisOverlay } from './ImageAnalysisOverlay';

interface ImageUploaderProps {
  onImageUpload?: (file: File) => void;
  imagePreviewUrl: string | null;
  analysis?: RoomAnalysis | null;
  isAnalyzing?: boolean;
  highlightedSuggestion?: string | null;
  onHighlight?: (suggestion: string | null) => void;
  isReadOnly?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageUpload, 
    imagePreviewUrl, 
    analysis,
    isAnalyzing,
    highlightedSuggestion,
    onHighlight,
    isReadOnly = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || !onImageUpload) return;
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    if (isReadOnly || !onImageUpload) return;
    fileInputRef.current?.click();
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly || !onImageUpload) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if(file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif'))){
        onImageUpload(file);
    }
  }, [onImageUpload, isReadOnly]);

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };


  return (
    <div className="flex flex-col space-y-3">
       <h2 className="text-xl font-bold text-slate-800">1. 방 사진 업로드</h2>
       <div
          className={`relative group w-full h-80 rounded-xl transition-all duration-300 ease-in-out
            ${isReadOnly 
                ? 'bg-surface shadow-lg' 
                : `cursor-pointer bg-slate-50/50 border-2 border-dashed ${isDragging ? 'border-primary bg-accent/50 scale-105' : 'border-slate-300 hover:border-secondary'}`
            }`
          }
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragEnter}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
        {imagePreviewUrl ? (
          <>
            {(analysis && analysis.improvementSuggestions.some(s => s.boundingBox) && onHighlight) ? (
              <ImageAnalysisOverlay
                imageUrl={imagePreviewUrl}
                suggestions={analysis.improvementSuggestions}
                highlightedSuggestion={highlightedSuggestion}
                onHighlight={onHighlight}
              />
            ) : (
              <img src={imagePreviewUrl} alt="Room preview" className="object-cover w-full h-full rounded-xl" />
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-30 transition-opacity duration-300">
                <div className="absolute inset-0 w-full h-full bg-slate-200 rounded-xl overflow-hidden">
                    <div className="w-full h-full animate-shimmer" style={{ background: 'linear-gradient(to right, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)', backgroundSize: '2000px 100%' }} />
                </div>
                <div className="relative text-slate-700 text-center p-4">
                   <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 font-semibold">AI가 분석 중입니다...</p>
                </div>
              </div>
            )}
            
            {!isReadOnly && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-xl z-20">
                    <p className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">이미지 변경</p>
                </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center p-4">
              <div className="opacity-0 animate-stagger-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '100ms' }}>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                    {isDragging ? '파일을 놓아주세요!' : '클릭하거나 파일을 이곳으로 드래그하세요'}
                </p>
              </div>
              <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '200ms' }}>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, AVIF, HEIC</p>
              </div>
            </div>
            {!isReadOnly && (
                <button type="button" onClick={handleClick} className="absolute bottom-6 right-6 bg-primary hover:bg-primary-light text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-10" aria-label="이미지 업로드">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}
          </>
        )}
        {!isReadOnly && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp, image/avif, .heic, .heif"
            />
        )}
       </div>
    </div>
  );
};