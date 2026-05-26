import { Shield, Sparkles, Activity, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import JawVisualizer from '../components/JawVisualizer';

export default function Services() {
  const { t } = useTranslation();
  const services = [
    { title: t('svc_root_canal'), desc: t('svc_root_canal_desc'), icon: <Activity className="w-8 h-8" /> },
    { title: t('svc_crowns'), desc: t('svc_crowns_desc'), icon: <Shield className="w-8 h-8" /> },
    { title: t('svc_implants'), desc: t('svc_implants_desc'), icon: <Sparkles className="w-8 h-8" /> },
    { title: t('svc_extraction'), desc: t('svc_extraction_desc'), icon: <Plus className="w-8 h-8" /> },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('comprehensive_care')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('services_desc')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((svc, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-primary/20 border border-gray-100 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{svc.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{svc.title}</h3>
              <p className="text-gray-600 leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-24 animate-in slide-in-from-bottom-8 duration-700 fade-in delay-200">
          <div className="text-center mb-10">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">{t('adv_tech_3d')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('understand_3d')}</h2>
          </div>
          <JawVisualizer />
        </div>
      </div>
    </div>
  );
}
