
import React, { useState, useEffect } from 'react';
import { AppView, KnowledgeSource, FatwaMessage, UserProfile } from './types';
import ChatSection from './components/ChatSection';
import AccountSection from './components/AccountSection';
import VideoAnalysis from './components/VideoAnalysis';
import HistorySection from './components/HistorySection';
import SetupScreen from './components/SetupScreen';
import ValidatorSection from './components/ValidatorSection';
import { 
  ChatBubbleLeftRightIcon, 
  VideoCameraIcon, 
  ShieldCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassCircleIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [activeMessages, setActiveMessages] = useState<FatwaMessage[]>([]);
  const [permanentHistory, setPermanentHistory] = useState<FatwaMessage[]>([]);
  const [isInputActive, setIsInputActive] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fatwa_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fatwa_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('fatwa_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const initialSources: KnowledgeSource[] = [
      { id: '1', bookName: 'التاج المذهب', author: 'أحمد بن يحيى المرتضى', category: 'أخرى' },
      { id: '2', bookName: 'لباب الأفكار', author: 'متعدد', category: 'أخرى' },
      { id: '3', bookName: 'الأحكام', author: 'الإمام الهادي يحيى بن الحسين', category: 'أخرى' },
      { id: '4', bookName: 'المجموع الفقهي والحديثي', author: 'الإمام زيد بن علي', category: 'أخرى' },
      { id: '5', bookName: 'البحر الزخار', author: 'الإمام أحمد بن يحيى المرتضى', category: 'أخرى' },
      { id: '6', bookName: 'شرح الأزهار', author: 'الإمام المرتضى', category: 'أخرى' },
      { id: '7', bookName: 'متن الأزهار', author: 'الإمام أحمد بن يحيى المرتضى', category: 'أخرى' }
    ];
    setSources(initialSources);
    
    const savedHistory = localStorage.getItem('fatwa_permanent_history');
    if (savedHistory) {
      try {
        const historyData = JSON.parse(savedHistory).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        setPermanentHistory(historyData);
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleSetupComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('fatwa_user_profile', JSON.stringify(profile));
  };

  const handleInputFocus = () => setIsInputActive(true);
  const handleInputBlur = () => setTimeout(() => setIsInputActive(false), 150);

  if (!user) {
    return <SetupScreen onComplete={handleSetupComplete} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`fixed inset-0 flex flex-col font-['Tajawal'] text-right select-none overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
      <div className={`absolute inset-0 -z-10 opacity-40 ${isDarkMode ? 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900' : 'bg-gradient-to-br from-emerald-50/60 via-slate-50 to-emerald-50/40'}`} />
      
      <header className={`pt-5 pb-4 px-6 flex justify-between items-center backdrop-blur-lg border-b z-30 shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-emerald-900/10'}`}>
        <div className="flex items-center gap-3.5">
          <div className="bg-emerald-950 p-2.5 rounded-2xl shadow-lg rotate-3">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black leading-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-950'}`}>فتوى</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] mt-1.5 opacity-50 uppercase">Smart Fatwa AI</p>
          </div>
        </div>
        
        <button onClick={() => setCurrentView(AppView.SETTINGS)} className={`p-3 rounded-2xl transition-all ${currentView === AppView.SETTINGS ? 'bg-emerald-950 text-white shadow-xl' : (isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-900')}`}>
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full max-w-2xl mx-auto flex flex-col">
          <div className={`flex-1 overflow-y-auto px-5 pt-6 pb-48`}>
            {currentView === AppView.CHAT && <ChatSection messages={activeMessages} setMessages={setActiveMessages} sources={sources} onFocus={handleInputFocus} onBlur={handleInputBlur} isInputActive={isInputActive} isDarkMode={isDarkMode} />}
            {currentView === AppView.VIDEO && <VideoAnalysis sources={sources} onFocus={handleInputFocus} onBlur={handleInputBlur} isDarkMode={isDarkMode} />}
            {currentView === AppView.VALIDATOR && <ValidatorSection onFocus={handleInputFocus} onBlur={handleInputBlur} isDarkMode={isDarkMode} />}
            {currentView === AppView.HISTORY && <HistorySection messages={permanentHistory} isDarkMode={isDarkMode} />}
            {currentView === AppView.SETTINGS && (
              <AccountSection 
                user={{ name: user.name, email: user.contact }} 
                sources={sources} 
                onAddSource={(s) => setSources([...sources, s])} 
                onRemoveSource={(id) => setSources(sources.filter(s => s.id !== id))}
                onLogout={() => setActiveMessages([])}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
            )}
          </div>
        </div>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-all transform ${isInputActive ? 'translate-y-full opacity-0' : 'translate-y-0'}`}>
        <div className={`backdrop-blur-2xl px-3 pt-2 pb-4 border-t transition-colors ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-emerald-900/10'}`}>
          <div className="max-w-md mx-auto flex justify-between items-center gap-1">
            <NavButton active={currentView === AppView.CHAT} onClick={() => setCurrentView(AppView.CHAT)} icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />} label="الفتوى" isDarkMode={isDarkMode} />
            <NavButton active={currentView === AppView.VIDEO} onClick={() => setCurrentView(AppView.VIDEO)} icon={<VideoCameraIcon className="w-5 h-5" />} label="الوسائط" isDarkMode={isDarkMode} />
            <NavButton active={currentView === AppView.VALIDATOR} onClick={() => setCurrentView(AppView.VALIDATOR)} icon={<MagnifyingGlassCircleIcon className="w-5 h-5" />} label="التحقق" isDarkMode={isDarkMode} />
            <NavButton active={currentView === AppView.HISTORY} onClick={() => setCurrentView(AppView.HISTORY)} icon={<ClockIcon className="w-5 h-5" />} label="السجل" isDarkMode={isDarkMode} />
          </div>
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isDarkMode: boolean }> = ({ active, onClick, icon, label, isDarkMode }) => (
  <button onClick={onClick} className={`flex flex-1 flex-col items-center py-2 gap-0.5 rounded-2xl transition-all ${active ? 'bg-emerald-950 text-white shadow-lg scale-105' : (isDarkMode ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-950')}`}>
    {icon}
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default App;
