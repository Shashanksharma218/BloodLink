import React from 'react';

function DonorLoginModal({ isVisible, onClose }) {
  // If the modal is not visible, return nothing (null)
  if (!isVisible) {
    return null;
  }

  return (
    // Main modal container with a semi-transparent background
    // Added backdrop-blur-sm for the glass morphism effect
    // Added onClick={onClose} to allow closing the modal by clicking the background
    <div 
      className="fixed inset-0 bg-black/[0.4] bg-blend-overlay backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {/* Modal content box */}
      {/* Added onClick={(e) => e.stopPropagation()} to prevent clicks inside the modal from closing it */}
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        {/* Modal Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Donor Login</h2>
          <p className="text-gray-500 mt-2">Enter your contact number to receive an OTP.</p>
        </div>
        
        {/* Login Form */}
        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input 
              type="tel" 
              id="contactNumber" 
              name="contactNumber" 
              placeholder="10-digit mobile number" 
              required 
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonorLoginModal;

