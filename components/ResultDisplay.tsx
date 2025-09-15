import React, { useState } from 'react';
import { ImageComparator } from './ImageComparator';

interface ColorPaletteProps {
  palette: string[];
  showSnackbar: (message: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ palette, showSnackbar }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      showSnackbar(`색상 코드 ${color}가 복사되었습니다.`);
      setTimeout(() => setCopiedColor(null), 2000);
    }).catch(err => {
        console.error('Failed to copy color: ', err);
        showSnackbar('색상 코드 복사에 실패했습니다.');
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {palette.map((color) => (
        <div key={color} className="text-center group flex flex-col items-center">
          <button
            onClick={() => handleCopy(color)}
            className={`w-16 h-16 rounded-lg shadow-md border-2 hover:border-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-200 transform group-hover:scale-110 ${
                copiedColor === color ? 'border-secondary ring-2 ring-secondary scale-110' : 'border-slate-200'
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
  onContinueDesign: () => void;
  showSnackbar: (message: string) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, redesignedImage, description, colorPalette, onNewDesign, onContinueDesign, showSnackbar }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.href = redesignedImage;
    link.download = 'redesigned-interior.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('이미지가 성공적으로 저장되었습니다.');
  };
  
   const handleShare = () => {
    const shareText = `AI 인테리어 디자이너가 제안한 아이디어입니다:\n\n${description || '제공된 설명이 없습니다.'}`;
    navigator.clipboard.writeText(shareText)
      .then(() => showSnackbar('디자인 설명이 클립보드에 복사되었습니다!'))
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
        showSnackbar('설명 복사에 실패했습니다.');
      });
  };


  return (
    <>
    <div className="bg-surface rounded-2xl shadow-2xl shadow-slate-200/60 p-8 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* --- Left Column: Image Comparator --- */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Before & After
            </h2>
             <button 
                onClick={() => setIsFullscreen(true)}
                className="flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                aria-label="전체화면으로 보기"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5v4m0 0h4" />
                  </svg>
                  전체화면
              </button>
          </div>
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
                <ColorPalette palette={colorPalette} showSnackbar={showSnackbar} />
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
               <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                   <button
                      onClick={onContinueDesign}
                      className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-bold rounded-lg shadow-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5"
                      aria-label="현재 결과로 이어서 디자인하기"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      이어서 디자인하기
                  </button>
                  <button
                      onClick={onNewDesign}
                      className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-colors"
                      aria-label="새로운 이미지로 처음부터 시작하기"
                  >
                      처음부터 시작
                  </button>
              </div>

               <div className="w-full sm:w-auto inline-flex rounded-lg shadow-sm" role="group">
                <button
                    onClick={handleSaveImage}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 focus:z-10 focus:ring-2 focus:ring-primary"
                    aria-label="생성된 인테리어 이미지 저장"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    이미지 저장
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border-t border-b border-r border-slate-300 rounded-r-lg hover:bg-slate-100 focus:z-10 focus:ring-2 focus:ring-primary"
                    aria-label="디자인 설명 공유하기"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
                   </svg>
                   공유
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
    {isFullscreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="fullscreen-comparator-title">
          <div className="w-full h-full max-w-7xl max-h-[80vh] p-4 relative">
            <h2 id="fullscreen-comparator-title" className="sr-only">전체화면 이미지 비교</h2>
             <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-2 -right-2 sm:top-2 sm:right-2 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
              aria-label="전체화면 닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ImageComparator
              beforeImage={originalImage}
              afterImage={redesignedImage}
              description={description}
            />
          </div>
        </div>
    )}
    </>
  );
};