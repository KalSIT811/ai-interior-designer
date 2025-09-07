import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">최근 디자인 히스토리</h2>
      {history.length === 0 ? (
        <p className="text-slate-500">아직 생성된 디자인이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {history.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.03] animate-slide-up-fade"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <img
                src={item.result.image || item.originalImage}
                alt={`히스토리: ${item.prompt}`}
                className="w-full h-40 object-cover"
              />
              {item.designMode === '3d' && (
                <div className="absolute top-2 right-2 bg-teal-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  3D 뷰
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{item.prompt}</p>
              </div>
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-xl">
                <p className="text-white text-lg font-bold opacity-0 group-hover:opacity-100">결과 보기</p>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};