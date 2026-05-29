import { Award, Stethoscope, ChevronLeft, ChevronRight, Plus, Trash2, Edit, X, Upload, Save, DollarSign, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

import binuImg from '../assets/Binu.jpeg';
import lokaswariImg from '../assets/Lokaswari.jpeg';

const API_BASE = "https://binu-s-dental-backend.vercel.app";

interface DoctorType {
  _id?: string;
  name: string;
  qualifications: string;
  bio: string;
  patientsTreated?: string;
  experienceYears?: string;
  image?: string;
  specialties?: string[];
  consultationFee?: number;
  availableDays?: string[];
}

export default function Doctors() {
  const { t } = useTranslation();
  const { dbUser } = useAuth();
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'doctor';

  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DoctorType | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formQual, setFormQual] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPatients, setFormPatients] = useState('100+');
  const [formYears, setFormYears] = useState('5+');
  const [formImage, setFormImage] = useState('');
  const [formSpecialties, setFormSpecialties] = useState('');
  const [formFee, setFormFee] = useState(500);
  const [formDays, setFormDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

  const toggleDay = (day: string) => {
    setFormDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getFileUrl = (url: string | undefined, defaultImg: string) => {
    if (!url) return defaultImg;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
  };

  // Fallback doctors in case API fails or returns empty
  const getFallbackDoctors = (): DoctorType[] => [
    {
      name: "Dr. Binu",
      qualifications: "BDS • Lead Surgeon",
      bio: "With more than 29 years of experience and thousands of successful smile transformations, Dr. Binu makes advanced dental care comfortable and accessible. Her expertise spans complex root canals, implantology, and aesthetic smile design. She is deeply committed to changing the perception of dental anxiety by ensuring every patient enjoys a gentle, transparent, and completely stress-free treatment journey.",
      patientsTreated: '200k+',
      experienceYears: '29+',
      image: binuImg,
      specialties: ["Root Canal Specialist", "Dental Implants", "Laser Dentistry", "Cosmetic Dentistry"],
      consultationFee: 500,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      name: "Dr. Yogeswari.S",
      qualifications: "BDS • Assistant Surgeon",
      bio: "Dr. Yogeswari.S is a highly skilled dental surgeon with over 8 years of clinical experience in restoring oral health and function. She specializes in advanced root canal therapy, dental implants, and cosmetic dentistry, combining technical precision with a patient-first philosophy. Known for her gentle chairside manner, Dr. Yogeswari.S focuses on delivering stress-free, minimally invasive care tailored to each patient's unique needs.",
      patientsTreated: '100+',
      experienceYears: '8+',
      image: lokaswariImg,
      specialties: ["Root Canal Specialist", "Dental Implants", "Laser Dentistry", "Cosmetic Dentistry"],
      consultationFee: 500,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors');
      const apiDocs = res.data?.doctors || [];
      if (apiDocs.length > 0) {
        setDoctors(apiDocs);
      } else {
        setDoctors(getFallbackDoctors());
      }
    } catch (err) {
      console.error("Error fetching doctors, using fallback:", err);
      setDoctors(getFallbackDoctors());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === doctors.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? doctors.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (doctors.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [doctors.length]);

  // Open modal to add a new doctor
  const handleAddClick = () => {
    setEditingDoc(null);
    setFormName('');
    setFormQual('');
    setFormBio('');
    setFormPatients('100+');
    setFormYears('5+');
    setFormImage('');
    setFormSpecialties('Root Canal Specialist, Dental Implants, Laser Dentistry, Cosmetic Dentistry');
    setFormFee(500);
    setFormDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setIsModalOpen(true);
  };

  // Open modal to edit a doctor
  const handleEditClick = (doc: DoctorType) => {
    setEditingDoc(doc);
    setFormName(doc.name);
    setFormQual(doc.qualifications);
    setFormBio(doc.bio);
    setFormPatients(doc.patientsTreated || '100+');
    setFormYears(doc.experienceYears || '5+');
    setFormImage(doc.image || '');
    setFormSpecialties(doc.specialties?.join(', ') || '');
    setFormFee(doc.consultationFee || 500);
    setFormDays(doc.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setIsModalOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/doctors/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setFormImage(res.data.url);
        toast.success("📷 Image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
    }
    setUploading(false);
  };

  // Handle save (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formQual || !formBio) {
      toast.error("Please fill in Name, Qualifications, and Bio.");
      return;
    }

    const payload = {
      name: formName,
      qualifications: formQual,
      bio: formBio,
      patientsTreated: formPatients,
      experienceYears: formYears,
      image: formImage,
      specialties: formSpecialties.split(',').map(s => s.trim()).filter(Boolean),
      consultationFee: formFee,
      availableDays: formDays
    };

    try {
      if (editingDoc?._id) {
        // Update
        const res = await api.put(`/doctors/${editingDoc._id}`, payload);
        if (res.data?.success) {
          toast.success("✨ Doctor profile updated successfully!");
          fetchDoctors();
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await api.post('/doctors', payload);
        if (res.data?.success) {
          toast.success("🎉 New doctor profile added successfully!");
          fetchDoctors();
          setIsModalOpen(false);
          setCurrentSlide(doctors.length); // Slide to newly added doctor
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save profile.");
    }
  };

  // Handle delete
  const handleDeleteClick = async (id: string | undefined, name: string) => {
    if (!id) {
      toast.error("Default profiles cannot be deleted. Add them as admin profiles first.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${name}'s profile?`)) return;

    try {
      const res = await api.delete(`/doctors/${id}`);
      if (res.data?.success) {
        toast.success("🗑️ Doctor profile deleted!");
        fetchDoctors();
        setCurrentSlide(0);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete profile.");
    }
  };

  // Helper to translate doctor fields based on the name or database state
  const getTranslatedDoctor = (doc: DoctorType) => {
    if (doc.name === "Dr. Binu") {
      return {
        ...doc,
        name: t('doc_name'),
        qualifications: t('doc_qual'),
        bio: t('doc_bio'),
        specialties: doc.specialties?.map(spec => {
          if (spec === "Root Canal Specialist") return t('spec_rootcanal');
          if (spec === "Dental Implants") return t('spec_implants');
          if (spec === "Laser Dentistry") return t('spec_laser');
          if (spec === "Cosmetic Dentistry") return t('spec_cosmetic');
          return spec;
        })
      };
    }
    if (doc.name === "Dr. Yogeswari.S" || doc.name === "Dr. Yogeswari") {
      return {
        ...doc,
        name: t('doc2_name'),
        qualifications: t('doc2_qual'),
        bio: t('doc2_bio'),
        specialties: doc.specialties?.map(spec => {
          if (spec === "Root Canal Specialist") return t('spec_rootcanal');
          if (spec === "Dental Implants") return t('spec_implants');
          if (spec === "Laser Dentistry") return t('spec_laser');
          if (spec === "Cosmetic Dentistry") return t('spec_cosmetic');
          return spec;
        })
      };
    }
    return {
      ...doc,
      specialties: doc.specialties?.map(spec => {
        if (spec === "Root Canal Specialist") return t('spec_rootcanal');
        if (spec === "Dental Implants") return t('spec_implants');
        if (spec === "Laser Dentistry") return t('spec_laser');
        if (spec === "Cosmetic Dentistry") return t('spec_cosmetic');
        return spec;
      })
    };
  };

  const getTranslatedDays = (days: string[] | undefined) => {
    if (!days) return [];
    return days.map(day => {
      const lower = day.toLowerCase();
      if (lower === 'monday') return t('monday');
      if (lower === 'tuesday') return t('tuesday');
      if (lower === 'wednesday') return t('wednesday');
      if (lower === 'thursday') return t('thursday');
      if (lower === 'friday') return t('friday');
      if (lower === 'saturday') return t('saturday');
      if (lower === 'sunday') return t('sunday');
      return day;
    });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header with Admin HUD */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('meet_specialist')}</h1>
            <p className="text-xl text-gray-600 max-w-2xl">{t('meet_specialist_sub')}</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> Add Doctor Profile
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="relative animate-in fade-in zoom-in duration-700">
            <div className="overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100 glass">
              <div 
                className="flex transition-transform duration-700 ease-in-out" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {doctors.map((rawDoc, index) => {
                  const doc = getTranslatedDoctor(rawDoc);
                  const translatedDays = getTranslatedDays(doc.availableDays);
                  const defaultAvatar = index === 0 ? binuImg : lokaswariImg;
                  return (
                    <div key={doc._id || index} className="w-full flex-shrink-0 p-10 relative">
                      
                      {/* Floating Admin Controls */}
                      {isAdmin && (
                        <div className="absolute top-6 right-8 flex items-center gap-2.5 z-10 glass px-4 py-2 rounded-2xl border border-white/20 shadow-md">
                          <button
                            onClick={() => handleEditClick(rawDoc)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition text-primary"
                            title="Edit Doctor"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rawDoc._id, rawDoc.name)}
                            className="p-2 hover:bg-red-50 rounded-xl transition text-red-600"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-100">
                            <img 
                              src={getFileUrl(doc.image, defaultAvatar)} 
                              alt={doc.name} 
                              className="w-full h-full object-cover object-top" 
                            />
                          </div>
                          <div className="absolute -bottom-6 -right-6 glass px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
                             <Award className="w-8 h-8 text-yellow-500" />
                             <div>
                               <p className="font-bold text-gray-900">{t('rating_label')}</p>
                               <p className="text-sm text-gray-500">{t('google_reviews')}</p>
                             </div>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{doc.name}</h2>
                            <p className="text-xl text-primary font-medium">{doc.qualifications}</p>
                          </div>
                          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{doc.bio}</p>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                              <div className="text-3xl font-bold text-primary mb-1">{doc.patientsTreated || '100+'}</div>
                              <div className="text-sm font-medium text-gray-600">{t('patients_treated')}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                              <div className="text-3xl font-bold text-primary mb-1">{doc.experienceYears || '5+'}</div>
                              <div className="text-sm font-medium text-gray-600">{t('years_exp')}</div>
                            </div>
                          </div>

                          {doc.specialties && doc.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {doc.specialties.map((spec, i) => (
                                <span key={i} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}

                          {doc.availableDays && doc.availableDays.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{t('availability') || 'Available'}: {translatedDays.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100 hover:scale-110 active:scale-95"
                aria-label="Previous doctor"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-3">
                {doctors.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button 
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100 hover:scale-110 active:scale-95"
                aria-label="Next doctor"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out / Modal Drawer for Doctor Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 scale-in">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-primary" />
                {editingDoc ? 'Modify Doctor Profile' : 'Add New Doctor Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Binu"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Qualifications / Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={formQual}
                    onChange={e => setFormQual(e.target.value)}
                    placeholder="e.g. BDS • Lead Surgeon"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Doctor Biography / Bio *</label>
                <textarea
                  required
                  rows={4}
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  placeholder="Tell us about the doctor's expert experience, specialty, and treatment approach..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition resize-none"
                />
              </div>

              {/* Patients & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Patients Treated Count</label>
                  <input
                    type="text"
                    value={formPatients}
                    onChange={e => setFormPatients(e.target.value)}
                    placeholder="e.g. 200k+"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={formYears}
                    onChange={e => setFormYears(e.target.value)}
                    placeholder="e.g. 29+"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                  />
                </div>
              </div>

              {/* Specialties / Tags */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Specialties / Tags (Comma separated)</label>
                <input
                  type="text"
                  value={formSpecialties}
                  onChange={e => setFormSpecialties(e.target.value)}
                  placeholder="Root Canal Specialist, Dental Implants, Laser Dentistry, Cosmetic Dentistry"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                />
              </div>

              {/* Consultation Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-primary" /> Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formFee}
                    onChange={e => setFormFee(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                  />
                </div>
                
                {/* Photo Upload */}
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Doctor Profile Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="No photo uploaded"
                      value={formImage}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 outline-none truncate"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 bg-primary text-white rounded-xl hover:bg-primary/90 flex items-center gap-1.5 text-sm font-bold transition disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" /> {uploading ? "..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Days */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${formDays.includes(day) ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
