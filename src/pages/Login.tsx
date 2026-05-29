import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/portal';
  const [isLogin, setIsLogin] = useState(!searchParams.get('signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let role = "patient";
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        toast.success(t('login_success'));
        const token = await userCred.user.getIdToken();
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        role = data.user?.role;
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        toast.success(t('signup_success'));
      }
      
      if (role === "admin" || role === "doctor") {
        navigate("/admin/portal");
      } else {
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      toast.error(error.message || t('auth_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      toast.success(t('google_login_success'));
      
      const token = await userCred.user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const role = data.user?.role;
      
      if (role === "admin" || role === "doctor") {
        navigate("/admin/portal");
      } else {
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      toast.error(error.message || t('google_login_failed'));
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 m-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? t('login_welcome_back') : t('login_create_account')}
          </h2>
          <p className="text-gray-500">
            {isLogin ? t('login_enter_details') : t('login_signup_details')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login_fullname')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder={t('login_fullname_placeholder')}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login_email_address')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login_password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/30 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? t('login_sign_in') : t('login_sign_up')
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-400">{t('login_or_continue_with')}</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-6 w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? t('no_account') + " " : t('have_account') + " "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline focus:outline-none"
          >
            {isLogin ? t('sign_up') : t('login')}
          </button>
        </p>
        
        <div className="mt-6 text-center text-xs">
          <Link to="/admin/login" className="text-gray-400 hover:text-gray-600 underline">
            {t('staff_login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
