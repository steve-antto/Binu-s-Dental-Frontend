import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Shield, Clock, Phone } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    { icon: <Shield className="w-6 h-6" />, title: t('expert_care'), desc: t('expert_care_desc') },
    { icon: <Clock className="w-6 h-6" />, title: t('support_24'), desc: t('support_24_desc') },
    { icon: <Calendar className="w-6 h-6" />, title: t('easy_booking'), desc: t('easy_booking_desc') },
  ];

  return (
    <div className="pt-20 min-h-screen flex flex-col">
      <div className="relative flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-50 blur-3xl opacity-60" />
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-50 blur-3xl opacity-60" />
        </div>
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {t('modern_dental')}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {t('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <Link to="/booking" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                {t('book_appointment')}
              </Link>
              <a href="tel:+917708056650" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg hover:bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-1">
                <Phone className="w-5 h-5" /> {t('call_us')}
              </a>
            </div>
          </div>
          <div className="relative hidden md:block animate-in slide-in-from-right-12 duration-1000 fade-in">
            <div className="aspect-square bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[3rem] rotate-3 overflow-hidden border-8 border-white shadow-2xl relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center -rotate-3 scale-110" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="bg-green-100 p-3 rounded-full text-green-600"><Shield className="w-6 h-6" /></div>
              <div>
                <p className="font-bold text-gray-900">{t('certified')}</p>
                <p className="text-sm text-gray-500">{t('professionals')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
