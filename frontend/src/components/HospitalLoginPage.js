import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import loginIllustration from 'url:../assets/login-illustration.svg'; 

function HospitalLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const MOCK_USER = "bloodlink.iiitu@gmail.com";
    const MOCK_PASS = "UnaHP@123";

    setTimeout(() => {
        if (email === MOCK_USER && password === MOCK_PASS) {
            login({ type: 'hospital', email: MOCK_USER });
            navigate('/hospital-dashboard'); // redirect to hospital dashboard
        } else {
            setError("Invalid email or password. Please try again.");
        }
        setIsLoading(false);
    }, 1500);
  };

  return (
    // Responsive padding adjusted for smaller screens
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-x-12 gap-y-8 items-center bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto">
          
          <div className="w-full md:order-1">
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Hospital Login</h2>
                <p className="text-gray-600 mt-2">Access the dashboard to manage blood requests.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bloodlink.iiitu@gmail.com" 
                  required 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" 
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" 
                />
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex flex-col items-center text-center md:order-2">
            <img src={loginIllustration} alt="Secure Login Illustration" className="w-full max-w-xs sm:max-w-sm mb-6" />
            <h3 className="text-2xl font-bold text-gray-800">Secure & Simple</h3>
            <p className="text-gray-600 mt-2 max-w-xs">Manage your blood donation requests through our secure portal.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HospitalLoginPage;

