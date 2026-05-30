import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(true);
      
      // Verify role with backend — explicitly pass token in header
      const response = await api.post('/auth/sync-user', { token }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.user.role === 'admin' || response.data.user.role === 'doctor') {
         toast.success("Admin access granted.");
         const token = await userCredential.user.getIdToken(true);
         localStorage.setItem("token", token);
         navigate('/portal', { replace: true });
      } else {
         await signOut(auth);
         localStorage.removeItem('firebaseIdToken');
         toast.error("Unauthorized. You are not an admin.");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 border border-gray-100 animate-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/30">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('admin_portal')}</h2>
          <p className="text-gray-500">{t('secure_staff_login')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all font-medium" 
              placeholder="admin@binusdental.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('password')}</label>
            <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all font-medium" 
                  placeholder="••••••••" 
                />
                <Lock className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('access_portal')}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
            {t('restricted_access')}
        </div>
      </div>
    </div>
  );
}
