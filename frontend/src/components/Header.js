import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonorLoginModal from './DonorLoginModal';
import bloodIcon from "url:../assets/blood-drop.png";
import { useAuth } from '../context/AuthContext'; // 1. Import the useAuth hook

function Header() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth(); // 2. Get auth state and functions

  const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#dc2626' : '#4b5563',
  });

  const closeMenu = () => setMenuOpen(false);

  // Helper function to get the initial for the avatar
  const getAvatarInitials = () => {
    if (!currentUser) return '';
    if (currentUser.type === 'hospital') return 'H';
    if (currentUser.name) return currentUser.name.charAt(0).toUpperCase();
    return 'D'; // Default for Donor
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-6 md:px-20 py-4 flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={bloodIcon} className='h-11 w-11' alt="BloodLink Logo"></img>
            <div>
              <div className="text-2xl font-semibold text-gray-900">BloodLink</div>
              <div className="text-sm text-gray-500 -mt-1">Una, Himachal Pradesh</div>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)} 
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Container */}
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center absolute md:static top-full left-0 w-full md:w-auto bg-white shadow-lg md:shadow-none p-6 md:p-0 space-y-4 md:space-y-0 md:space-x-8`}>
            {/* Nav Links */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 font-medium text-gray-600">
              <NavLink to="/" style={navLinkStyles} className="hover:text-red-600" onClick={closeMenu}>Home</NavLink>
              <NavLink to="/about" style={navLinkStyles} className="hover:text-red-600" onClick={closeMenu}>About</NavLink>
              <NavLink to="/contact" style={navLinkStyles} className="hover:text-red-600" onClick={closeMenu}>Contact Us</NavLink>
            </div>
            
            <div className="pt-4 md:pt-0 mt-4 md:mt-0 border-t md:border-none border-gray-100">
              {/* 3. Conditionally render Login Buttons OR User Avatar */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to={currentUser.type === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'}
                    className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-red-700 transition"
                    title="Go to Dashboard"
                    onClick={closeMenu}
                  >
                    {getAvatarInitials()}
                  </Link>
                  <button onClick={() => { logout(); closeMenu(); }} className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3">
                  <button 
                    onClick={() => { setModalVisible(true); closeMenu(); }}
                    className="bg-red-50 text-red-600 font-medium py-2 px-5 rounded-lg hover:bg-red-100 text-center"
                  >
                    Donor Login
                  </button>
                  <Link to="/hospital-login" onClick={closeMenu} className="bg-red-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-red-700 text-center">
                    Hospital Login
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {!isAuthenticated && (
        <DonorLoginModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} />
      )}
    </>
  );
}

export default Header;
