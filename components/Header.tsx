
import React from 'react';
import { Zap, Calendar, Settings, Languages, Cloud } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSecondSettings: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenSecondSettings, language, setLanguage, t }) => {
  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
            < Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">{t.appTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white/70 text-sm hidden lg:flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
          
          <button
            onClick={toggleLanguage}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all border border-white/30 text-sm flex items-center gap-2 font-medium"
            title="Switch Language"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <button 
            onClick={onOpenSettings} 
            className="bg-white/10 hover:bg-blue-500/30 text-white px-3 py-2 rounded-lg transition-all border border-white/30 text-sm flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>

          <button 
            onClick={onOpenSecondSettings} 
            className="bg-white/10 hover:bg-cyan-500/30 text-white px-3 py-2 rounded-lg transition-all border border-white/30 text-sm flex items-center gap-2"
          >
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">{t.secondSettings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
