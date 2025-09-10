import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonorLoginModal from './DonorLoginModal'; // Import the modal

function Header() {
  const [isModalVisible, setModalVisible] = useState(false);

  const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#dc2626' : '#4b5563',
  });

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-6 md:px-20 py-4 flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">BloodLink Una</div>
              <div className="text-sm text-gray-500 -mt-1">Himachal Pradesh</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
              <NavLink to="/" style={navLinkStyles} className="hover:text-red-600 transition-colors">Home</NavLink>
              <NavLink to="/about" style={navLinkStyles} className="hover:text-red-600 transition-colors">About</NavLink>
              <NavLink to="/contact" style={navLinkStyles} className="hover:text-red-600 transition-colors">Contact Us</NavLink>
            </div>
            
            {/* Login Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setModalVisible(true)} // This button now opens the modal
                className="bg-red-50 text-red-600 font-medium py-2 px-5 rounded-lg hover:bg-red-100 transition-colors duration-200 "
              >
                Donor Login
              </button>
              <Link to="/hospital-login" className="bg-red-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-200 ">
                Hospital Login
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Render the modal component */}
      <DonorLoginModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

export default Header;

