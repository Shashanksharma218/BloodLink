import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DonorLoginModal({ isVisible, onClose }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // Added for OTP input
  const [otpSent, setOtpSent] = useState(false); // Added to track UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  if (!isVisible) {
    return null;
  }

  // A new close handler to reset all state
  const handleClose = () => {
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setError('');
    onClose();
  };

  // --- STEP 1: Send the OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // Assumes a new endpoint for sending OTP
        const response = await fetch('http://localhost:5555/api/donors/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP. Please try again.');
        }

        // On success, show the OTP input form
        setOtpSent(true);

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // --- STEP 2: Verify OTP and Login ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // Assumes the login endpoint now validates email AND otp
        const response = await fetch('http://localhost:5555/api/donors/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }), // Sending both
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            // This will show the "OTP doesn't match" error from the backend
            throw new Error(data.message || 'Login failed. Please check the OTP and try again.');
        }
        // On successful login, update the global auth state
        login({ type: 'donor', ...data });
        
        // Close the modal and navigate to the dashboard
        handleClose(); // Use new handler to reset state
        navigate('/donor-dashboard');

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black/[0.4] backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={handleClose} // Use new close handler
    >
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose} // Use new close handler
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        {!otpSent ? (
          // ----- STEP 1: Email Form -----
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Donor Login</h2>
              <p className="text-gray-500 mt-2">Enter your registered email to get an OTP.</p>
            </div>
            
            <form onSubmit={handleSendOtp} className="mt-4 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@address.com" 
                  required 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </form>
          </>
        ) : (
          // ----- STEP 2: OTP Form -----
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              {/* This is the message you requested */}
              <p className="text-gray-500 mt-2">
                Please enter the OTP sent to <strong className="text-gray-700">{email}</strong>
              </p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One-Time Password</label>
                {/* This is the OTP entering field */}
                <input 
                  type="text" 
                  id="otp" 
                  name="otp" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP" 
                  required 
                  maxLength={6}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="pt-2">
                {/* This is the submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400"
                >
                  {isLoading ? 'Verifying...' : 'Login'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Shared Error Display: This will show errors from both steps */}
        {error && (
            <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <p>{error}</p>
            </div>
        )}
          
      </div>
    </div>
  );
}

export default DonorLoginModal;