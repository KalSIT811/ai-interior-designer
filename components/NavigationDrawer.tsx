import React from 'react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavLink: React.FC<{ href: string; icon: React.ReactNode; children: React.ReactNode; isComingSoon?: boolean }> = ({ href, icon, children, isComingSoon }) => (
    <a
        href={href}
        onClick={(e) => { isComingSoon && e.preventDefault()}}
        className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors relative ${
            isComingSoon 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        <span className="mr-4 text-slate-500">{icon}</span>
        <span>{children}</span>
        {isComingSoon && <span className="absolute right-4 text-xs bg-slate-200 text-slate-500 font-semibold px-2 py-0.5 rounded-full">곧 출시</span>}
    </a>
);


export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <aside 
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-surface border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
           <div className="flex items-center space-x-3">
                 <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                 </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  AI 디자이너
                </h1>
              </div>
        </div>
        <nav className="p-4">
            <ul className="space-y-2">
                <li>
                    <NavLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}>
                        홈
                    </NavLink>
                </li>
                 <li>
                    <NavLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} isComingSoon>
                        내 프로젝트
                    </NavLink>
                </li>
                <li>
                    <NavLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} isComingSoon>
                        갤러리
                    </NavLink>
                </li>
                 <li>
                    <NavLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} isComingSoon>
                        설정
                    </NavLink>
                </li>
            </ul>
        </nav>
      </aside>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40" aria-hidden="true" />}
    </>
  );
};