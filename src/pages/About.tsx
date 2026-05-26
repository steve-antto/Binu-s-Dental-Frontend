import { ShieldCheck, Activity, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('about_clinic')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('about_sub')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="glass p-8 rounded-3xl text-center shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('autoclave')}</h3>
            <p className="text-gray-600">{t('autoclave_desc')}</p>
          </div>
          <div className="glass p-8 rounded-3xl text-center shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6"><Activity className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('adv_tech')}</h3>
            <p className="text-gray-600">{t('adv_tech_desc')}</p>
          </div>
          <div className="glass p-8 rounded-3xl text-center shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6"><Award className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('strict_hygiene')}</h3>
            <p className="text-gray-600">{t('strict_hygiene_desc')}</p>
          </div>
        </div>
        <div className="glass p-10 rounded-3xl border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('our_legacy')}</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">{t('legacy_p1')}</p>
          <p className="text-lg text-gray-700 leading-relaxed">{t('legacy_p2')}</p>
        </div>
      </div>
    </div>
  );
}
