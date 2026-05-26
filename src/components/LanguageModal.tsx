import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
];

export default function LanguageModal({ onComplete }: { onComplete?: () => void }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelected = localStorage.getItem('languageSelected');
    if (!hasSelected) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (code: string) => {
    setSelectedLang(code);
  };

  const handleSave = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('languageSelected', 'true');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Globe className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('select_language')}</h2>
          <p className="text-gray-500 mt-2 text-sm">Please select your preferred language for the best experience.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedLang === lang.code
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-3 text-lg font-medium text-gray-800">
                <span className="text-2xl">{lang.flag}</span>
                {lang.name}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedLang === lang.code ? 'border-primary' : 'border-gray-300'
              }`}>
                {selectedLang === lang.code && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/30"
        >
          {t('save_language')}
        </button>
      </div>
    </div>
  );
}
