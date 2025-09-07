import React from 'react';

export const Welcome: React.FC = () => {
    return (
        <div className="text-center py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 animate-fade-in">
            <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '100ms' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L14.25 14.5M9.75 3.104a2.25 2.25 0 00-1.5 2.122v5.714a2.25 2.25 0 00.659 1.591L9.5 14.5m-1.243-7.642A3.375 3.375 0 006.75 4.875c-1.125 0-2.158.5-2.812 1.312M14.25 14.5L19 19.25M14.25 14.5A2.25 2.25 0 0112 16.75v5.714a2.25 2.25 0 01-2.25 2.25H9.75a2.25 2.25 0 01-2.25-2.25V16.75M14.25 14.5L19 19.25" />
                </svg>
            </div>
            <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '200ms' }}>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">AI 인테리어 디자이너에 오신 것을 환영합니다!</h3>
            </div>
            <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '300ms' }}>
                <p className="mt-2 text-md text-slate-700 max-w-2xl mx-auto">
                    당신의 공간을 새롭게 변신시켜 보세요. 방 사진을 올리고, 원하는 스타일을 설명한 뒤, '디자인 생성하기' 버튼을 누르면 AI가 마법처럼 새로운 인테리어를 제안해 드립니다.
                </p>
            </div>
        </div>
    );
};