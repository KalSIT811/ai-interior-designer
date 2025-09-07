import React, { useState, useRef, useEffect } from 'react';
import { ImprovementSuggestion } from '../types';

interface ImageAnalysisOverlayProps {
  imageUrl: string;
  suggestions: ImprovementSuggestion[];
  highlightedSuggestion: string | null;
  onHighlight: (suggestion: string | null) => void;
}

export const ImageAnalysisOverlay: React.FC<ImageAnalysisOverlayProps> = ({ imageUrl, suggestions, highlightedSuggestion, onHighlight }) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<ImprovementSuggestion | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        setImageDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };
    
    const img = imageRef.current;
    if (img) {
      img.addEventListener('load', updateDimensions, { once: true });
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(img);

      if (img.complete) {
        updateDimensions();
      }

      return () => {
        if(img) {
            resizeObserver.unobserve(img);
        }
      };
    }
  }, [imageUrl]);

  const handleMouseEnter = (suggestion: ImprovementSuggestion) => {
    onHighlight(suggestion.suggestion);
    setHoveredSuggestion(suggestion);
  };
  
  const handleMouseLeave = () => {
    onHighlight(null);
    setHoveredSuggestion(null);
  };

  return (
    <div className="relative w-full h-full">
      <img ref={imageRef} src={imageUrl} alt="Room for analysis" className="object-cover w-full h-full rounded-xl" draggable="false" />
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {imageDimensions && suggestions.map((s, index) => {
          if (!s.boundingBox) return null;

          const isActive = highlightedSuggestion === s.suggestion;
          const [x_min, y_min, x_max, y_max] = s.boundingBox;

          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${x_min * 100}%`,
            top: `${y_min * 100}%`,
            width: `${(x_max - x_min) * 100}%`,
            height: `${(y_max - y_min) * 100}%`,
            backgroundColor: isActive ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.15)',
            border: `3px solid ${isActive ? '#047857' : '#14B8A6'}`, // teal-700, teal-500
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            zIndex: 10,
            pointerEvents: 'auto',
            transform: isActive ? 'scale(1.02)' : 'scale(1)',
            borderRadius: '0.75rem', // Make the box rounded to match the pulse effect
          };

          return (
            <div key={index}>
              <div
                className={isActive ? "animate-pulse-border" : ""}
                style={style}
                onMouseEnter={() => handleMouseEnter(s)}
                onMouseLeave={handleMouseLeave}
                aria-label={`Suggestion area: ${s.suggestion}`}
              />
              {hoveredSuggestion?.suggestion === s.suggestion && (
                <div
                  className="absolute bg-white p-3 rounded-lg shadow-lg text-sm text-slate-800 z-20 max-w-[250px] animate-fade-in pointer-events-none"
                  style={{
                    left: `calc(${x_min * 100}% + 5px)`,
                    top: `calc(${y_max * 100}% + 5px)`,
                  }}
                >
                  <span className="font-semibold">💡 제안:</span> {s.suggestion}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};