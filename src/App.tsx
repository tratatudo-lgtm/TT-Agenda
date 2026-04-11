import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import axios from 'axios';
import { getDefaultCurrency } from './utils/format';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Agenda from './pages/Agenda';
import Settings from './pages/Settings';
import Support from './pages/Support';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { setCountry, setCurrency, country, currency } = useAuthStore();

  useEffect(() => {
    const detectLocation = async () => {
      // Only detect if not already set or if it's the default
      if (country === 'PT' && currency === 'EUR') {
        try {
          const response = await axios.get('https://ipapi.co/json/');
          if (response.data && response.data.country_code) {
            const detectedCountry = response.data.country_code;
            const detectedCurrency = response.data.currency || getDefaultCurrency(detectedCountry);
            setCountry(detectedCountry);
            setCurrency(detectedCurrency);
          }
        } catch (error) {
          console.error('Error detecting location:', error);
        }
      }
    };
    detectLocation();
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#0f172a',
            borderRadius: '16px',
            padding: '16px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<Services />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
