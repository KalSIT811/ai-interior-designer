import React from 'react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
    <div className="bg-surface p-6 rounded-xl border border-slate-200/80 opacity-0 animate-stagger-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent-dark text-primary">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
);

export const Welcome: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="text-center py-10 px-4 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '100ms' }}>
                     <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                        AI로 <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">꿈의 공간</span>을 현실로
                    </h1>
                </div>
                <div className="opacity-0 animate-stagger-in" style={{ animationDelay: '250ms' }}>
                    <p className="mt-6 text-lg text-slate-700 max-w-2xl mx-auto">
                        방 사진 한 장과 당신의 아이디어만 있다면, AI 인테리어 디자이너가 완전히 새로운 공간을 눈앞에 펼쳐줍니다.
                    </p>
                </div>
                <div className="opacity-0 animate-stagger-in mt-10" style={{ animationDelay: '400ms' }}>
                     <button
                        onClick={onStart}
                        className="px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 text-lg"
                    >
                        지금 바로 시작하기
                    </button>
                </div>
                
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <FeatureCard
                        delay={600}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        title="사진 한 장으로 시작"
                        description="당신의 방 사진을 업로드하여 디자인 프로세스를 시작하세요. AI가 공간의 특징을 즉시 분석합니다."
                    />
                    <FeatureCard
                        delay={700}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L14.25 14.5m-4.75 6.896l4.25-4.25" /></svg>}
                        title="AI의 맞춤 제안"
                        description="AI가 현재 공간의 장단점을 분석하고, 개선점과 새로운 스타일을 추천하여 영감을 줍니다."
                    />
                    <FeatureCard
                        delay={800}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                        title="자유로운 커스텀"
                        description="'미드센츄리 모던 스타일로', '따뜻한 조명을 추가해줘' 와 같이 자유롭게 요청하여 결과를 만들어보세요."
                    />
                </div>
            </div>
        </div>
    );
};