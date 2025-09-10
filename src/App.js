import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your new components
import Header from './components/Header';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import DonorRegistrationPage from './components/DonorRegistrationPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header will be on every page */}
      <Header />
      
      {/* Routes will determine which page's main content is shown */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-donor" element={<DonorRegistrationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* You can add other pages here later, like this: */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
      </Routes>
      
      {/* Footer will also be on every page */}
      <Footer />
    </div>
  );
}

export default App;
