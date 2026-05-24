import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import DashboardLayout from './layout/DashboardLayout';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Predictions from './pages/Predictions/Predictions';
import Patients from './pages/Patients/Patients';
import PatientDetail from './pages/Patients/PatientDetail';

// Placeholder components for missing routes
const Insights = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Insights</h1><p className="text-slate-500">Coming soon: Advanced healthcare analytics and AI-driven insights.</p></div>;
const Reports = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Reports</h1><p className="text-slate-500">Coming soon: Exportable clinical reports and patient summaries.</p></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Settings</h1><p className="text-slate-500">Coming soon: Configure your account and clinical preferences.</p></div>;
const FAQ = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">FAQ</h1><p className="text-slate-500">Coming soon: Frequently asked questions about NeoHealth AI.</p></div>;
const Contact = () => <div className="p-8 text-center py-20"><h1 className="text-3xl font-bold mb-4">Contact Us</h1><p className="text-slate-500">Have questions? Reach out to our clinical support team.</p></div>;
const About = () => <div className="p-8 text-center py-20"><h1 className="text-3xl font-bold mb-4">About NeoHealth AI</h1><p className="text-slate-500">Pioneering neonatal healthcare through predictive artificial intelligence.</p></div>;

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
            <Route path="faq" element={<FAQ />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
