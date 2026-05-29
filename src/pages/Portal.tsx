import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, User, Settings, FileText, ShieldCheck, Users, BarChart3, CreditCard, ClipboardList, ScanLine, Pill, Upload, X, ZoomIn, Trash2, Camera } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import InteractiveDentalChart from '../components/InteractiveDentalChart';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface FileItem { _id?: string; filename: string; url: string; resourceType?: string; name?: string; }
interface PhotoItem { filename: string; url: string; caption?: string; }
interface Appt { _id: string; patientName: string; patientPhone: string; patientEmail: string; date: string; time: string; service: string; status: string; paymentStatus: string; paymentAmount: number; prescription: string; medicalHistory: string; notes: string; scans: FileItem[]; reports: FileItem[]; photos: PhotoItem[]; dentalChart?: any; }

// Lightbox component for enlarging images
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition"><X className="w-6 h-6" /></button>
      <div className="max-w-4xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
        <p className="text-center text-white/80 mt-3 text-sm">{alt}</p>
      </div>
    </div>
  );
}

export default function Portal() {
  const { currentUser, dbUser } = useAuth();
  const { t, i18n } = useTranslation();
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'doctor';
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appt | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const scanFileRef = useRef<HTMLInputElement>(null);
  const reportFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyAppointments, setDailyAppointments] = useState<Appt[]>([]);
  const [medicalHistory, setMedicalHistory] = useState("");

  useEffect(() => {
    if (selectedAppt) {
      setMedicalHistory(selectedAppt?.medicalHistory || "");
    }
  }, [selectedAppt]);

  useEffect(() => {
    if (currentUser && typeof currentUser.getIdToken === 'function') {
      currentUser.getIdToken().then(setToken);
    } else {
      setToken(localStorage.getItem('token') || '');
    }
  }, [currentUser]);

  const fetchAppointmentsByDate = async () => {
    const token = await auth.currentUser?.getIdToken(true);
    const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
    
    const response = await fetch(
      `${API_URL}/api/v1/medical/appointments/date/${selectedDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    setAppointments(data.appointments || []);
  };

  useEffect(() => {
    if (isAdmin) fetchAppointmentsByDate();
  }, [selectedDate]);

  const refreshAppts = () => {
    const endpoint = isAdmin ? '/medical/all-appointments' : '/medical/my-appointments';
    api.get(endpoint).then(res => {
      const appts = res.data?.appointments || [];
      setAppointments(appts);
      // Refresh selected appointment if one is selected
      if (selectedAppt) {
        const updated = appts.find((a: Appt) => a._id === selectedAppt._id);
        if (updated) setSelectedAppt(updated);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { if (currentUser) refreshAppts(); }, [currentUser, isAdmin]);

  if (!currentUser) return <div className="pt-32 text-center min-h-screen"><h2 className="text-2xl font-bold">{t('login_required')}</h2></div>;

  const statusColor = (s: string) => s === 'completed' ? 'bg-green-100 text-green-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
  const payColor = (s: string) => s === 'paid' ? 'bg-green-100 text-green-700' : s === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const updateField = async (id: string, field: string, value: any) => {
    try {
      if (field === 'status') await api.patch(`/appointments/${id}/status`, { status: value });
      else if (field === 'payment') await api.patch(`/appointments/${id}/payment`, value);
      else if (field === 'prescription') await api.patch(`/medical/appointments/${id}/prescription`, { prescription: value });
      else if (field === 'medicalHistory') await api.patch(`/medical/appointments/${id}/medical-history`, { medicalHistory: value });
      toast.success(t('save_btn') + ' ✓');
      refreshAppts();
    } catch (e: any) { toast.error(e.response?.data?.message || t('update_failed')); }
  };

  const uploadFile = async (id: string, type: 'scan' | 'report', file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/medical/appointments/${id}/upload-${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${type === 'scan' ? '📷 ' + t('scans_label') : '📄 ' + t('reports_label')} ` + t('uploaded'));
      refreshAppts();
    } catch (e: any) { toast.error(e.response?.data?.message || t('upload_failed')); }
    setUploading(false);
  };

  const uploadPhoto = async (id: string, file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/medical/appointments/${id}/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('📸 ' + t('photo_uploaded'));
      refreshAppts();
    } catch (e: any) { toast.error(e.response?.data?.message || t('upload_failed')); }
    setUploading(false);
  };

  const deletePhoto = async (id: string, url: string) => {
    try {
      await api.delete(`/medical/appointments/${id}/files`, { data: { type: 'photo', url } });
      toast.success(t('delete_success'));
      refreshAppts();
    } catch (e: any) { toast.error(e.response?.data?.message || t('update_failed')); }
  };

  const deleteReport = async (reportId: string) => {
    try {
      await api.delete(`/medical/report/${reportId}`);
      refreshAppts();
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Delete failed");
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      await api.delete(`/medical/scan/${scanId}`);
      refreshAppts();
      toast.success("Scan deleted successfully");
    } catch (error) {
      console.error("Delete scan failed", error);
      toast.error("Delete scan failed");
    }
  };

  const deleteAppointment = async (id: string, patientName: string) => {
    if (!window.confirm(`Are you sure you want to delete the appointment for ${patientName}?`)) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("🗑️ Appointment deleted successfully!");
      setSelectedAppt(null);
      refreshAppts();
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('update_failed'));
    }
  };

  const getFileUrl = (url: string | undefined | null) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };


  const todayAppts = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const thisMonthAppts = appointments.filter(a => a.date?.startsWith(new Date().toISOString().slice(0, 7)));

  return (
    <>
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}

      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{t('welcome')}, {dbUser?.name || currentUser.displayName || 'User'}</h1>
              {isAdmin && <span className="px-3 py-1 bg-blue-900 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span>}
            </div>
            <p className="text-gray-500 mt-1">{isAdmin ? t('manage_clinic') : t('manage_records')}</p>
          </div>

          {/* Admin Stats */}
          {isAdmin && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white p-5 rounded-2xl shadow-lg"><Users className="w-7 h-7 mb-2 opacity-80" /><h3 className="text-2xl font-bold">{appointments.length}</h3><p className="text-blue-200 text-sm">{t('total_appointments')}</p></div>
              <div className="bg-gradient-to-br from-primary to-cyan-500 text-white p-5 rounded-2xl shadow-lg"><Calendar className="w-7 h-7 mb-2 opacity-80" /><h3 className="text-2xl font-bold">{todayAppts.length}</h3><p className="text-cyan-100 text-sm">{t('today')}</p></div>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white p-5 rounded-2xl shadow-lg"><BarChart3 className="w-7 h-7 mb-2 opacity-80" /><h3 className="text-2xl font-bold">{thisMonthAppts.length}</h3><p className="text-emerald-100 text-sm">{t('this_month')}</p></div>
              <div className="bg-gradient-to-br from-amber-600 to-amber-500 text-white p-5 rounded-2xl shadow-lg"><CreditCard className="w-7 h-7 mb-2 opacity-80" /><h3 className="text-2xl font-bold">₹{appointments.reduce((s, a) => s + (a.paymentAmount || 0), 0)}</h3><p className="text-amber-100 text-sm">{t('revenue')}</p></div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Appointments List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isAdmin && (
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <label className="font-semibold block mb-2 text-gray-700">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 font-medium bg-white"
                    />
                  </div>
                )}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Calendar className="text-primary w-6 h-6" /> {isAdmin ? t('all_appointments') : t('my_appointments')}</h2>
                  <Link to="/booking" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">{t('book_now')}</Link>
                </div>
                {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> :
                appointments.length === 0 ? (
                  <div className="p-12 text-center text-gray-400"><Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>{t('no_appointments')}</p></div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                    {appointments.map(appt => (
                      <div key={appt._id} onClick={() => setSelectedAppt(appt)} className={`p-4 cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedAppt?._id === appt._id ? 'bg-blue-50 border-l-4 border-primary' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{appt.patientName || 'Patient'}</p>
                            <p className="text-sm text-gray-500">{appt.service} · {appt.date} · {appt.time}</p>
                            {isAdmin && <p className="text-xs text-gray-400 mt-1">📞 {appt.patientPhone} · ✉️ {appt.patientEmail}</p>}
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(appt.status)}`}>{t(appt.status) || appt.status}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${payColor(appt.paymentStatus || 'pending')}`}>₹{appt.paymentAmount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar with Profile & Preferences */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6"><User className="text-primary w-6 h-6" /> {t('profile')}</h2>
                <div className="space-y-4 text-sm">
                  <div><label className="block text-sm text-gray-500">{t('email')}</label><p className="font-medium text-gray-900">{currentUser.email}</p></div>
                  <div><label className="block text-sm text-gray-500">{t('status_lbl')}</label>
                    <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-700'}`}>{isAdmin ? '🛡️ ' + t('admin_doctor') : '✅ ' + t('active_patient')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4"><Settings className="text-primary w-6 h-6" /> {t('preferences')}</h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('language')}</label>
                <select value={i18n.language.substring(0, 2)} onChange={(e) => i18n.changeLanguage(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary outline-none text-sm">
                  <option value="en">English</option><option value="ta">Tamil (தமிழ்)</option><option value="ml">Malayalam (മലയാളം)</option><option value="hi">Hindi (हिन्दी)</option><option value="te">Telugu (తెలుగు)</option>
                </select>
              </div>
              {!selectedAppt && <p className="text-center text-gray-400 text-sm">← {t('select_appt')}</p>}
            </div>
          </div>

          {/* Full Horizontal Width Selected Appointment Details */}
          {selectedAppt && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
              {/* Header Card with Patient Photo */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  {/* Patient Photo Avatar */}
                  <div className="relative group flex-shrink-0">
                    {selectedAppt.photos?.length > 0 ? (
                      <div className="cursor-pointer" onClick={() => setLightbox({ src: getFileUrl(selectedAppt.photos[selectedAppt.photos.length - 1].url), alt: selectedAppt.patientName })}>
                        <img
                          src={getFileUrl(selectedAppt.photos[selectedAppt.photos.length - 1].url)}
                          alt={selectedAppt.patientName}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-200 shadow-md group-hover:border-violet-400 transition-all group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl flex items-center justify-center transition-all">
                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 border-2 border-dashed border-violet-300 flex items-center justify-center text-violet-400">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                    {isAdmin && (
                      <>
                        <input type="file" ref={photoFileRef} accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files?.[0] && selectedAppt) uploadPhoto(selectedAppt._id, e.target.files[0]); }} />
                        <button
                          disabled={uploading}
                          onClick={() => photoFileRef.current?.click()}
                          className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-md transition-all active:scale-90 z-10"
                          title={t('upload_photo')}
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Patient Info */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="text-primary w-6 h-6" /> 
                      {selectedAppt.patientName} - {selectedAppt.service}
                    </h2>
                    <p className="text-gray-500 mt-1">{selectedAppt.date} · {selectedAppt.time}</p>
                    {selectedAppt.photos?.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {selectedAppt.photos.map((p, i) => (
                          <div key={i} className="relative group/thumb cursor-pointer" onClick={() => setLightbox({ src: getFileUrl(p.url), alt: p.caption || p.filename })}>
                            <img src={getFileUrl(p.url)} alt={p.caption || p.filename} className="w-9 h-9 rounded-lg object-cover border border-gray-200 hover:border-violet-400 transition-all hover:shadow-md" />
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); deletePhoto(selectedAppt._id, p.url); }}
                                className="absolute -top-1 -right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm transition-all z-10 opacity-0 group-hover/thumb:opacity-100"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {isAdmin && (
                    <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <label className="text-gray-500 text-xs font-bold block">{t('status_lbl')}</label>
                        <select value={selectedAppt.status} onChange={e => updateField(selectedAppt._id, 'status', e.target.value)} className="mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white">
                          <option value="scheduled">{t('scheduled')}</option><option value="completed">{t('completed')}</option><option value="cancelled">{t('cancelled')}</option><option value="no-show">No Show</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs font-bold block">{t('payment_lbl')} (₹)</label>
                        <div className="flex gap-2 mt-1">
                          <input type="number" defaultValue={selectedAppt.paymentAmount} id="payAmt" className="w-24 px-3 py-1.5 border rounded-lg text-sm bg-white" />
                          <select defaultValue={selectedAppt.paymentStatus || 'pending'} id="paySts" className="px-2 py-1.5 border rounded-lg text-sm bg-white">
                            <option value="pending">{t('pending')}</option><option value="paid">{t('paid')}</option><option value="partial">{t('partial')}</option>
                          </select>
                          <button onClick={() => updateField(selectedAppt._id, 'payment', { paymentAmount: +(document.getElementById('payAmt') as any)?.value, paymentStatus: (document.getElementById('paySts') as any)?.value })} className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-all">{t('save_btn')}</button>
                        </div>
                      </div>

                      {/* Multi-Day Treatment UI */}
                      <div className="w-full mt-2 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <input type="checkbox" id="multiDayToggle" className="w-4 h-4 cursor-pointer" />
                          <label htmlFor="multiDayToggle" className="text-sm font-bold text-gray-800 cursor-pointer">Multi-Day Treatment</label>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-end">
                          <div>
                            <label className="text-gray-500 text-xs font-bold block">Treatment Start</label>
                            <input type="date" className="mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white" />
                          </div>
                          
                          <div>
                            <label className="text-gray-500 text-xs font-bold block">Treatment End</label>
                            <input type="date" className="mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white" />
                          </div>
                          
                          <div>
                            <label className="text-gray-500 text-xs font-bold block">Time Slot</label>
                            <select className="mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white">
                              <option>10:00 AM</option>
                              <option>10:30 AM</option>
                              <option>11:00 AM</option>
                              <option>11:30 AM</option>
                              <option>12:00 PM</option>
                              <option>04:00 PM</option>
                              <option>04:30 PM</option>
                              <option>05:00 PM</option>
                              <option>05:30 PM</option>
                              <option>06:00 PM</option>
                              <option>06:30 PM</option>
                              <option>07:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isAdmin && (
                    <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-500 text-xs font-bold mr-2">{t('payment_lbl')}:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${payColor(selectedAppt.paymentStatus || 'pending')}`}>₹{selectedAppt.paymentAmount || 0}</span>
                      <span className="text-gray-500 text-sm ml-2">({t(selectedAppt.paymentStatus || 'pending')})</span>
                    </div>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => deleteAppointment(selectedAppt._id, selectedAppt.patientName)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-600/10"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Appointment
                    </button>
                  )}
                  <button onClick={() => setSelectedAppt(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">✕ {t('close_btn') || 'Close'}</button>
                </div>
              </div>

              {/* Grid for Prescription & Medical History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prescription */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2"><Pill className="w-5 h-5 text-primary" /> {t('prescription')}</h3>
                  {isAdmin ? (
                    <div>
                      <textarea id="rxField" defaultValue={selectedAppt.prescription} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={t('prescription') + '...'} />
                      <button onClick={() => updateField(selectedAppt._id, 'prescription', (document.getElementById('rxField') as any)?.value)} className="mt-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold w-full transition-all">{t('save_prescription')}</button>
                    </div>
                  ) : (
                    <div className={`text-sm whitespace-pre-wrap rounded-xl p-4 ${selectedAppt.prescription ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-gray-50 text-gray-400'}`}>
                      {selectedAppt.prescription || t('no_prescription')}
                    </div>
                  )}
                </div>

                {/* Medical History */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> {t('medical_history')}</h3>
                  {isAdmin ? (
                    <div>
                      <textarea value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={t('medical_history') + '...'} />
                      <button onClick={() => updateField(selectedAppt._id, 'medicalHistory', medicalHistory)} className="mt-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold w-full transition-all">{t('save_btn')}</button>
                      
                      {selectedAppt?._id && (
                        <InteractiveDentalChart
                          key={selectedAppt._id}
                          appointmentId={selectedAppt._id}
                          existingChart={selectedAppt?.dentalChart}
                          medicalHistory={medicalHistory}
                        />
                      )}
                    </div>
                  ) : (
                    <div className={`text-sm whitespace-pre-wrap rounded-xl p-4 ${selectedAppt.medicalHistory ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-gray-50 text-gray-400'}`}>
                      {selectedAppt.medicalHistory || t('no_history')}
                    </div>
                  )}
                </div>
              </div>

              {/* Scans & Reports Card (Spans Full Horizontal Width!) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3 text-lg">
                  <ScanLine className="w-5 h-5 text-primary" /> {t('scans_reports')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Column 1: Scans */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                      📷 {t('scans_label')}
                    </p>
                    {selectedAppt.scans?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedAppt?.scans?.map(
                          (scan: any, index: number) => {
                            const isPdf =
                              scan.url?.toLowerCase().includes(".pdf") ||
                              scan.resourceType === "raw";

                            return (
                              <div
                                key={index}
                                className="border rounded-lg p-3 flex flex-col items-center bg-white shadow-sm"
                              >
                                {isPdf ? (
                                  <>
                                    <div className="text-5xl">📄</div>

                                    <a
                                      href={scan.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline mt-2 text-sm text-center"
                                    >
                                      Open Scan PDF
                                    </a>
                                  </>
                                ) : (
                                  <img
                                    src={scan.url}
                                    alt="scan"
                                    className="w-48 h-48 object-cover rounded"
                                  />
                                )}

                                <p className="mt-2 text-sm text-gray-500">
                                  {scan.name || scan.filename || "Scan"}
                                </p>

                                {isAdmin && scan._id && (
                                  <button
                                    onClick={() => deleteScan(scan._id!)}
                                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                  >
                                    Delete Scan
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">{t('no_scans_yet')}</p>
                    )}
                  </div>

                  {/* Column 2: Reports */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                      📄 {t('reports_label')}
                    </p>
                    {selectedAppt.reports?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedAppt?.reports?.map(
                          (report: any, index: number) => {
                            const isPdf =
                              report.url?.toLowerCase().includes(".pdf") ||
                              report.resourceType === "raw";

                            return (
                              <div
                                key={index}
                                className="border rounded-lg p-3 flex flex-col items-center bg-white shadow-sm"
                              >
                                {isPdf ? (
                                  <>
                                    <div className="text-5xl">📄</div>

                                    <a
                                      href={report.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline mt-2 text-sm text-center"
                                    >
                                      Open PDF Report
                                    </a>
                                  </>
                                ) : (
                                  <img
                                    src={report.url}
                                    alt="report"
                                    className="w-48 h-48 object-cover rounded"
                                  />
                                )}

                                <p className="mt-2 text-sm text-gray-500">
                                  {report.name || report.filename || "Report"}
                                </p>

                                {isAdmin && report._id && (
                                  <button
                                    onClick={() => deleteReport(report._id!)}
                                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-2">{t('no_reports_yet')}</p>
                    )}
                  </div>
                </div>

                {/* Admin upload buttons */}
                {isAdmin && (
                  <div className="pt-4 mt-6 border-t space-y-3">
                    <input type="file" ref={scanFileRef} accept="image/*,.pdf" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0] && selectedAppt) uploadFile(selectedAppt._id, 'scan', e.target.files[0]); }} />
                    <input type="file" ref={reportFileRef} accept="image/*,.pdf" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0] && selectedAppt) uploadFile(selectedAppt._id, 'report', e.target.files[0]); }} />

                    <div className="flex gap-2 max-w-md">
                      <button disabled={uploading} onClick={() => scanFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                        <Upload className="w-4 h-4" /> {uploading ? '...' : t('upload_scan')}
                      </button>
                      <button disabled={uploading} onClick={() => reportFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                        <Upload className="w-4 h-4" /> {uploading ? '...' : t('upload_report')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
