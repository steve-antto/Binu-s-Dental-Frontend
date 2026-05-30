import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './i18n/config';

// Components
import Navbar from './components/Navbar';
import LanguageModal from './components/LanguageModal';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Portal from './pages/Portal';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import Doctors from './pages/Doctors';
import Reviews from './pages/Reviews';
import Booking from './pages/Booking';
import AdminLogin from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <LanguageModal />
      <Toaster position="top-right" />
    </div>
  );
}

// Routes configured below

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('welcome');
  }, [i18n.language, t]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="booking" element={<Booking />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin/portal" element={<AdminPortal />} />
            <Route path="login" element={<Login />} />
            <Route path="portal" element={<Portal />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
