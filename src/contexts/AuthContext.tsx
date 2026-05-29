import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  dbUser: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateLanguagePreference: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem("token", token);
          setCurrentUser(user);
          
          const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
          const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const data = await response.json();
          setDbUser(data.user);
          
          // If language was previously selected, update backend
          const savedLang = localStorage.getItem('i18nextLng');
          if (savedLang && data.user) {
             await api.patch(`/auth/users/${data.user._id}/language`, { language: savedLang }).catch(e => console.warn('Language sync failed', e));
          }
          
        } catch (error) {
          console.error("Token refresh or sync error:", error);
          toast.error("Failed to authenticate with server");
        }
      } else {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setDbUser(null);
      localStorage.removeItem('firebaseIdToken');
      localStorage.removeItem('token');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Failed to log out");
    }
  };

  const updateLanguagePreference = async (lang: string) => {
    if (dbUser?._id) {
      try {
        await api.patch(`/auth/users/${dbUser._id}/language`, { language: lang });
      } catch (error) {
        console.error("Failed to update language on server", error);
      }
    }
  };

  const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 min

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        // Only trigger alert/logout if user is actually logged in
        if (auth.currentUser) {
          logout();
          alert("Session expired. Please login again.");
        }
      }, SESSION_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer);

      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  const value = {
    currentUser,
    dbUser,
    loading,
    logout,
    updateLanguagePreference
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
