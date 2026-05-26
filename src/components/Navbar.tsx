import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentUser, dbUser, logout } = useAuth();
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'doctor';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'ta', name: 'TA' },
    { code: 'ml', name: 'ML' },
    { code: 'hi', name: 'HI' },
    { code: 'te', name: 'TE' }
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangDropdown(false);
  };

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('services'), path: '/services' },
    { name: t('doctors'), path: '/doctors' },
    { name: t('reviews'), path: '/reviews' },
    { name: t('about'), path: '/about' },
    { name: t('contact'), path: '/contact' }
  ];

  return (
    <nav className="fixed w-full z-40 top-0 glass transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Dr. Binu's Dental Clinic Logo" className="h-12 w-auto object-contain rounded-lg" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-blue-900 leading-none">
                {t('doc_name')}
              </span>
              <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase mt-0.5">
                {i18n.language?.startsWith('ta') ? 'பல் மருத்துவமனை' : i18n.language?.startsWith('ml') ? 'ഡെന്റൽ ക്ലിനിക്' : i18n.language?.startsWith('hi') ? 'डेंटल क्लिनिक' : i18n.language?.startsWith('te') ? 'డెంటల్ క్లినిక్' : 'Dental Clinic'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-gray-600 hover:text-primary font-medium transition-colors">
                {link.name}
              </Link>
            ))}

            <div className="relative">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 text-gray-600 hover:text-primary font-medium"
              >
                <Globe className="w-5 h-5" />
                <span>{languages.find(l => l.code === i18n.language?.substring(0,2))?.name || 'EN'}</span>
              </button>
              
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link to="/portal" className="text-gray-600 hover:text-primary font-medium flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {isAdmin ? t('admin_portal') : t('portal')}
                </Link>
                <button onClick={logout} className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 my-2 pt-2">
            <p className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Languages</p>
            <div className="flex flex-wrap gap-2 px-3 pb-2">
               {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i18n.language?.startsWith(lang.code) ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
            </div>
          </div>
          {currentUser ? (
            <>
              <Link to="/portal" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                {isAdmin ? t('admin_portal') : t('portal')}
              </Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50">
                {t('logout')}
              </button>
            </>
          ) : (
             <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 mt-2 text-center rounded-lg text-base font-medium bg-primary text-white hover:bg-primary-hover">
                {t('login')}
              </Link>
          )}
        </div>
      )}
    </nav>
  );
}
