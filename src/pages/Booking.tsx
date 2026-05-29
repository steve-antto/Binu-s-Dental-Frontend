import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle, MessageSquare, LogIn, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';



export default function Booking() {
  const { t } = useTranslation();
  const { currentUser, dbUser, loading: authLoading } = useAuth();
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'doctor';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill user details when logged in
  useEffect(() => {
    if (dbUser) {
      setPatientName(dbUser.name || currentUser?.displayName || '');
      setEmail(dbUser.email || currentUser?.email || '');
      setPhone(dbUser.phone || '');
    }
  }, [dbUser, currentUser]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!date) return;
    api.get(`/schedule/slots/${date}`)
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]));
  }, [date]);

  const validatePhone = (val: string) => {
    setPhone(val);
    if (val && !/^[6-9]\d{9}$/.test(val.replace(/\D/g, ''))) {
      setPhoneError(t('indian_phone_error'));
    } else { setPhoneError(''); }
  };

  const validateEmail = (val: string) => {
    setEmail(val);
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError(t('email_error'));
    } else { setEmailError(''); }
  };

  const isSunday = (dateStr: string) => new Date(dateStr).getDay() === 0;
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const today = getLocalDateString();

  const isTimeSlotPast = (slotStr: string) => {
    if (isAdmin) return false;
    if (date !== today) return false;
    const [timeStr, period] = slotStr.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError || emailError) return toast.error(t('validation_error'));
    if (isSunday(date)) return toast.error(t('sunday_holiday_alert'));
    setLoading(true);
    try {
      await api.post('/appointments/public-book', { patientName, phone, email, service, date, time, notes });
      setSuccess(true);
      toast.success(t('booking_success_msg'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('booking_failed'));
    } finally { setLoading(false); }
  };

  // ─── AUTH GATE: Show login prompt if not logged in ───
  if (!authLoading && !currentUser) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg w-full mx-4">
          <div className="glass p-10 md:p-14 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              {t('login_required_title') || 'Login Required'}
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {t('login_required_booking_msg') || 'Please log in or create an account to book your appointment. This helps us serve you better and manage your bookings.'}
            </p>

            {/* Benefits */}
            <div className="text-left space-y-3 mb-10 bg-gray-50 rounded-2xl p-6">
              {[
                t('benefit_auto_fill') || '✨ Auto-fill your details for faster booking',
                t('benefit_track') || '📋 Track all your appointments in one place',
                t('benefit_reminders') || '🔔 Receive appointment reminders',
                t('benefit_history') || '🏥 Access your treatment history'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login?redirect=/booking"
                className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {t('login') || 'Login'}
              </Link>
              <Link
                to="/login?redirect=/booking&signup=true"
                className="flex-1 py-4 bg-white hover:bg-gray-50 text-primary border-2 border-primary rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                {t('sign_up') || 'Sign Up'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-32 pb-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="glass p-12 rounded-3xl max-w-md text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10" /></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('booking_confirmed')}</h2>
          <p className="text-gray-600 mb-6">{t('booking_success_msg')}</p>
          <button onClick={() => { setSuccess(false); setPatientName(dbUser?.name || ''); setPhone(dbUser?.phone || ''); setEmail(dbUser?.email || ''); setService(''); setDate(''); setTime(''); setNotes(''); }}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors w-full">{t('book_another')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('book_appointment')}</h1>
          <p className="text-lg text-gray-600">{t('book_subtitle')}</p>
          <p className="text-sm text-red-500 mt-2 font-medium">🔴 {t('sunday_closed')}</p>
        </div>

        {/* Logged-in user info banner */}
        {dbUser && (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3 animate-in fade-in duration-500">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {t('booking_as') || 'Booking as'} {dbUser.name || currentUser?.displayName}
              </p>
              <p className="text-xs text-gray-500">{dbUser.email || currentUser?.email}</p>
            </div>
          </div>
        )}

        <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in duration-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {t('select_service')}</label>
              <select required value={service} onChange={(e) => setService(e.target.value)} className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-700 font-medium">
                <option value="">{t('choose_treatment')}</option>
                <optgroup label={t('featured_services')}>
                  <option value="Root Canal Treatment">{t('svc_root_canal')}</option>
                  <option value="Dental Crowns (Ceramic)">{t('svc_crowns_ceramic')}</option>
                  <option value="Dental Crowns (Zirconia)">{t('svc_crowns_zirconia')}</option>
                  <option value="Dental Crowns (Metal)">{t('svc_crowns_metal')}</option>
                  <option value="Dental Implants">{t('svc_implants')}</option>
                  <option value="Tooth Extraction">{t('svc_extraction')}</option>
                </optgroup>
                <optgroup label={t('general_dentistry')}>
                  <option value="General Consultation">{t('consultation_price_desc')}</option>
                  <option value="Scaling & Root Planing">{t('svc_scaling')}</option>
                  <option value="Laser Filling">{t('svc_laser_filling')}</option>
                  <option value="Traditional Filling">{t('svc_trad_filling')}</option>
                  <option value="Gingivectomy">{t('svc_gingivectomy')}</option>
                </optgroup>
                <optgroup label={t('cosmetic_dentistry')}>
                  <option value="Veneers">{t('svc_veneers')}</option>
                  <option value="Zirconia Crowns">{t('svc_zirconia')}</option>
                </optgroup>
                <optgroup label={t('prosthetics')}>
                  <option value="RPD (Removable Partial Denture)">{t('svc_rpd')}</option>
                  <option value="Complete Denture">{t('svc_complete_denture')}</option>
                </optgroup>
                <optgroup label={t('pediatric')}>
                  <option value="Kids Treatment">{t('svc_kids')}</option>
                </optgroup>
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-primary" /> {t('preferred_date')}</label>
                <input type="date" required min={isAdmin ? undefined : today} value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(''); if (isSunday(e.target.value)) toast.error(t('sundays_holiday_toast')); }}
                  className={`w-full px-5 py-4 bg-white rounded-2xl border text-lg min-h-[64px] shadow-inner ${date && isSunday(date) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-700'} focus:ring-2 focus:ring-primary outline-none font-bold transition-all`} />
                {date && isSunday(date) && <p className="text-red-500 text-sm font-medium">🔴 {t('sunday_closed_text')}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {t('preferred_time')}</label>
                {date && !isSunday(date) && slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot: any) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={slot.booked || isTimeSlotPast(slot.time)}
                        onClick={() => setTime(slot.time)}
                        className={`p-2 rounded font-medium text-sm transition-all
                        ${
                          slot.booked || isTimeSlotPast(slot.time)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : time === slot.time
                            ? "bg-blue-800 text-white ring-2 ring-blue-500 ring-offset-1"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 font-medium min-h-[64px] flex items-center">
                    {!date ? t('select_time') : (t('no_slots_available') || 'No slots available')}
                  </div>
                )}
                <input type="text" required value={time} onChange={() => {}} className="sr-only" tabIndex={-1} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {t('full_name')}</label>
              <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder={t('full_name_placeholder')} className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium" />
            </div>

            {/* Phone & Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {t('phone_number')}</label>
                <input type="tel" required value={phone} onChange={(e) => validatePhone(e.target.value)} placeholder="9876543210" maxLength={10}
                  className={`w-full px-5 py-4 bg-white rounded-2xl border ${phoneError ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium`} />
                {phoneError && <p className="text-red-500 text-xs font-medium">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {t('email_optional')}</label>
                <input type="email" value={email} onChange={(e) => validateEmail(e.target.value)} placeholder={t('email_placeholder')}
                  className={`w-full px-5 py-4 bg-white rounded-2xl border ${emailError ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium`} />
                {emailError && <p className="text-red-500 text-xs font-medium">{emailError}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> {t('message_label')}</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('message_placeholder')} className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none text-gray-700 font-medium resize-none" />
            </div>

            <button disabled={loading || (date && isSunday(date)) || !!phoneError} type="submit"
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CalendarIcon className="w-5 h-5" /> {t('confirm_appointment')}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
