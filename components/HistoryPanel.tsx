import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { SegmentedButton } from './SegmentedButton';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

type SortOrder = 'newest' | 'oldest';
type FilterMode = 'all' | '2d' | '3d';

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const processedHistory = useMemo(() => {
    return history
      .filter(item => {
        if (filterMode === 'all') return true;
        return item.designMode === filterMode;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        } else {
          return new Date(a.id).getTime() - new Date(b.id).getTime();
        }
      });
  }, [history, sortOrder, filterMode]);


  return (
    <div className="mt-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">최근 디자인 히스토리</h2>
        {history.length > 0 && (
          <div className="flex items-center gap-2" role="toolbar" aria-label="히스토리 정렬">
             <SegmentedButton
                options={[
                    { label: '최신순', value: 'newest' },
                    { label: '오래된순', value: 'oldest' },
                ]}
                value={sortOrder}
                onChange={(val) => setSortOrder(val as SortOrder)}
            />
          </div>
        )}
      </div>

      {history.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-600 mr-2">필터:</span>
              <button onClick={() => setFilterMode('all')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filterMode === 'all' ? 'bg-primary text-white ring-2 ring-primary/50' : 'bg-surface text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>전체</button>
              <button onClick={() => setFilterMode('2d')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filterMode === '2d' ? 'bg-primary text-white ring-2 ring-primary/50' : 'bg-surface text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>2D</button>
              <button onClick={() => setFilterMode('3d')} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filterMode === '3d' ? 'bg-primary text-white ring-2 ring-primary/50' : 'bg-surface text-slate-700 border border-slate-300 hover:bg-slate-100'}`}>3D</button>
          </div>
      )}

      {processedHistory.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">디자인 히스토리 없음</h3>
            <p className="mt-1 text-sm text-slate-500">
                {filterMode === 'all' ? '아직 생성된 디자인이 없습니다.' : '선택한 필터에 맞는 결과가 없습니다.'}
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {processedHistory.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 animate-slide-up-fade"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <img
                src={item.result.image || item.originalImage}
                alt={`히스토리: ${item.prompt}`}
                className="w-full h-40 object-cover"
              />
              {item.designMode === '3d' && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
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