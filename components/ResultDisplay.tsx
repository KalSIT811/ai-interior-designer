import React, { useState } from 'react';
import { ImageComparator } from './ImageComparator';

interface ColorPaletteProps {
  palette: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ palette }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    }).catch(err => {
        console.error('Failed to copy color: ', err);
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {palette.map((color) => (
        <div key={color} className="text-center group flex flex-col items-center">
          <button
            onClick={() => handleCopy(color)}
            className={`w-16 h-16 rounded-lg shadow-md border-2 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform group-hover:scale-110 ${
                copiedColor === color ? 'border-teal-500 ring-2 ring-teal-500 scale-110' : 'border-slate-200'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`색상 코드 ${color} 복사`}
          />
          <p 
            className="mt-1.5 text-xs font-mono text-slate-600 tracking-wide"
            aria-live="polite"
          >
            {copiedColor === color ? '복사됨!' : color}
          </p>
        </div>
      ))}
    </div>
  );
};

interface ResultDisplayProps {
  originalImage: string;
  redesignedImage: string;
  description: string;
  colorPalette: string[] | null;
  onNewDesign: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, redesignedImage, description, colorPalette, onNewDesign }) => {
  
  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.href = redesignedImage;
    link.download = 'redesigned-interior.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveDescription = () => {
    const textToSave = description || '제공된 설명이 없습니다.';
    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-description.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
   const handleShare = () => {
    const shareText = `AI 인테리어 디자이너가 제안한 아이디어입니다:\n\n${description}`;
    navigator.clipboard.writeText(shareText)
      .then(() => alert('디자인 설명이 클립보드에 복사되었습니다!'))
      .catch(err => console.error('클립보드 복사 실패:', err));
  };


  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 p-8 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* --- Left Column: Image Comparator --- */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center lg:text-left">
            Before & After
          </h2>
          <div className="flex-grow">
            <ImageComparator 
                beforeImage={originalImage} 
                afterImage={redesignedImage}
                description={description}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-3">
            슬라이더를 움직여 AI가 변경한 디자인을 확인해보세요.
          </p>
        </div>

        {/* --- Right Column: Description & Actions --- */}
        <div className="flex flex-col">
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">AI의 디자인 제안</h2>
            <div className="prose prose-slate max-w-none p-4 bg-slate-50/50 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                <p>{description || '제공된 설명이 없습니다.'}</p>
            </div>
             {colorPalette && colorPalette.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI 추천 색상 팔레트</h3>
                <ColorPalette palette={colorPalette} />
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4">
               <button
                  onClick={onNewDesign}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5"
                  aria-label="새 디자인 시작하기"
              >
                  새 디자인 시작
              </button>
              <div className="w-full sm:w-auto flex-grow flex justify-end gap-4">
                <button
                    onClick={handleSaveImage}
                    className="flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5"
                    aria-label="생성된 인테리어 이미지 저장"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    이미지
                </button>
                <button
                    onClick={handleSaveDescription}
                    className="flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5"
                    aria-label="AI 디자인 제안 설명 저장"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   설명
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};