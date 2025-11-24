import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import DonorRegistrationPage from './components/DonorRegistrationPage';
import DonorDashboardPage from './components/DonorDashboardPage';
import HospitalLoginPage from './components/HospitalLoginPage';
import HospitalDashboardPage from './components/HospitalDashboardPage'; 
import RegistrationSuccessPage from './components/RegistrationSuccessPage';
// import RequestDetailsPage from './components/RequestDetailsPage';

function App() {
  const ProtectedRoute = ({ children, allowedTypes }) => {
    const { currentUser } = useAuth();
    const isAllowed = currentUser && (!allowedTypes || allowedTypes.includes(currentUser.type));
    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/register-donor" element={<DonorRegistrationPage />} />
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute allowedTypes={["donor"]}>
                  <DonorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/hospital-login" element={<HospitalLoginPage />} />
            <Route
              path="/hospital-dashboard"
              element={
                <ProtectedRoute allowedTypes={["hospital"]}>
                  <HospitalDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            {/* <Route path="/request-details" element={<RequestDetailsPage />} /> */}
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

