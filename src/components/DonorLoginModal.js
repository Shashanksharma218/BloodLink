import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function DonorLoginModal({ isVisible, onClose }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If the modal is not visible, return nothing (null)
  if (!isVisible) {
    return null;
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    setIsLoading(true);
    console.log('Requesting OTP for:', phoneNumber);

    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp'); // Move to the next step
    }, 1500);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting OTP:', otp);

    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      navigate('/donor-dashboard') // Replace with actual login logic
      onClose(); // Close modal on success
    }, 1500);
  };

  // Reset state when closing the modal
  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    onClose();
  };

  return (
    // Main modal container with a semi-transparent background
    <div 
      className="fixed inset-0 bg-black/[0.4] backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={handleClose}
    >
      {/* Modal content box */}
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        {/* Conditional rendering based on the step */}
        {step === 'phone' ? (
          <>
            {/* Step 1: Phone Number Input */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Donor Login</h2>
              <p className="text-gray-500 mt-2">Enter your contact number to receive an OTP.</p>
            </div>
            
            <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input 
                  type="tel" 
                  id="contactNumber" 
                  name="contactNumber" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit mobile number" 
                  required 
                  pattern="\d{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Step 2: OTP Input */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-gray-500 mt-2">An OTP has been sent to {phoneNumber}.</p>
            </div>
            
            <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input 
                  type="text" 
                  id="otp" 
                  name="otp" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP" 
                  required 
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default DonorLoginModal;
