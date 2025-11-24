import React from 'react';
import { CheckCircle } from 'lucide-react';

function SuccessPopup({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-2xl z-50 animate-fade-in backdrop-blur-sm max-w-[calc(100vw-2rem)] sm:max-w-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <CheckCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
        <p className="font-semibold text-sm sm:text-base break-words">{message}</p>
      </div>
    </div>
  );
}

export default SuccessPopup;