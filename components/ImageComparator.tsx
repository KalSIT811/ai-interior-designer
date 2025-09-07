import React, { useState } from 'react';

interface ImageComparatorProps {
  beforeImage: string;
  afterImage: string;
  description?: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ beforeImage, afterImage, description }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };
  
  const altText = description ? `AI 디자인 결과: ${description.substring(0, 100)}...` : "Redesigned room";

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-md select-none group">
      <img
        src={afterImage}
        alt={altText}
        className="absolute top-0 left-0 w-full h-full object-cover"
        draggable="false"
      />
      <div
        className="absolute top-0 left-0 h-full w-full object-cover overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Original room"
          className="h-full w-full object-cover"
          draggable="false"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize backdrop-blur-sm"
        style={{
          left: `calc(${sliderPosition}% - 1px)`,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm cursor-ew-resize group-hover:scale-110 transition-transform duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
          </svg>
        </div>
      </div>
      <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full backdrop-blur-sm pointer-events-none">Before</div>
      <div className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white text-sm font-semibold rounded-full backdrop-blur-sm pointer-events-none">After</div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute top-0 left-0 w-full h-full cursor-ew-resize opacity-0"
        aria-label="비교 슬라이더"
      />
    </div>
  );
};