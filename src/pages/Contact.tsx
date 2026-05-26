import { MapPin, Phone, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return toast.error('Name and message are required');
    setLoading(true);
    try {
      await api.post('/contact', { name, email, message });
      toast.success('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('get_in_touch')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('contact_sub')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700 fade-in">
            <div className="glass p-8 rounded-3xl border border-gray-100 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact_info')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl"><MapPin className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-gray-900">{t('address_label')}</h4><p className="text-gray-600">{t('address_val')}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl"><Phone className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-gray-900">{t('phone_label')}</h4><p className="text-gray-600">+91 77080 56650</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl"><Clock className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-gray-900">{t('hours_label')}</h4><p className="text-gray-600 whitespace-pre-line">{t('hours_val')}</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass p-8 rounded-3xl border border-gray-100 shadow-lg animate-in slide-in-from-right-8 duration-700 fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('send_message')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('your_name')}</label><input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('your_email')}</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('your_msg')}</label><textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none"></textarea></div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center">
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('send_btn')}
              </button>
            </form>
          </div>
        </div>
        <div className="mt-16 animate-in slide-in-from-bottom-8 duration-700 fade-in delay-200">
          <div className="glass p-4 rounded-3xl border border-gray-100 shadow-lg h-[400px]">
            <iframe title="Dr. Binu's Dental Clinic Location" src="https://www.google.com/maps?q=Dr.%20Binu%27s%20Dental%20Clinic%2011.024342%2C76.9592671&z=20&output=embed" width="100%" height="100%" style={{ border: 0, borderRadius: '1rem' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
