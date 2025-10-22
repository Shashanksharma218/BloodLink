import React from 'react';
import { Link } from 'react-router-dom';

const SuccessIcon = () => (
    <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function RegistrationSuccessPage() {
  return (
    <main className="flex-grow flex items-center justify-center py-12 px-6 bg-gray-50">
      <div className="bg-white p-10 md:p-16 rounded-2xl shadow-xl max-w-lg w-full text-center">
        <SuccessIcon />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You for Registering!</h1>
        <p className="text-gray-600 text-lg mb-8">
            You are now a part of the BloodLink community. Your willingness to donate can save lives. You can now log in using your registered contact number from the homepage.
        </p>
        <Link 
          to="/"
          className="bg-red-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg inline-block"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default RegistrationSuccessPage;
