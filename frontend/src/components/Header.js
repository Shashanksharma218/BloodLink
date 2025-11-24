import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import DonorLoginModal from './DonorLoginModal';
import bloodIcon from "url:../assets/blood-drop.png";
import { useAuth } from '../context/AuthContext'; 

function Header() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth(); 
  const navigate = useNavigate();

  const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#dc2626' : '#374151',
  });

  const closeMenu = () => setMenuOpen(false);

  const getAvatarInitials = () => {
    if (!currentUser) return '';
    if (currentUser.type === 'hospital') return 'H';
    if (currentUser.fullName) return currentUser.fullName.charAt(0).toUpperCase();
    return 'D'; 
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm animate-slide-in-down">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-all duration-300"></div>
                <img 
                  src={bloodIcon} 
                  className='h-11 w-11 relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg' 
                  alt="BloodLink Logo" 
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300 tracking-tight">
                  BloodLink
                </div>
                <div className="text-sm text-gray-500 font-medium tracking-wide">Una, Himachal Pradesh</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink 
                to="/" 
                style={navLinkStyles} 
                className="px-4 py-2 text-[17px] rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                style={navLinkStyles} 
                className="px-4 py-2 text-[17px] rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                About
              </NavLink>
              <NavLink 
                to="/contact" 
                style={navLinkStyles} 
                className="px-4 py-2 text-[17px] rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                Contact
              </NavLink>
              {isAuthenticated && (
                <NavLink 
                  to={currentUser.type === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'}
                  style={navLinkStyles} 
                  className="px-4 py-2 text-[17px] rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  Dashboard
                </NavLink>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={currentUser.type === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'}
                    className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
                    title="Go to Dashboard"
                  >
                    {getAvatarInitials()}
                  </Link>
                  <button 
                    onClick={() => { logout(); navigate('/');}} 
                    className="px-4 py-2 text-[17px] font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setModalVisible(true)}
                    className="px-5 py-2.5 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Donor Login
                  </button>
                  <Link 
                    to="/hospital-login" 
                    className="px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:scale-105"
                  >
                    Hospital Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)} 
              className="md:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 backdrop-blur-xl bg-white/90 shadow-lg">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <NavLink 
                to="/" 
                style={navLinkStyles} 
                className="block px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200" 
                onClick={closeMenu}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                style={navLinkStyles} 
                className="block px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200" 
                onClick={closeMenu}
              >
                About
              </NavLink>
              <NavLink 
                to="/contact" 
                style={navLinkStyles} 
                className="block px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200" 
                onClick={closeMenu}
              >
                Contact
              </NavLink>
              {isAuthenticated && (
                <NavLink 
                  to={currentUser.type === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'}
                  style={navLinkStyles} 
                  className="block px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200" 
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              )}
              
              <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to={currentUser.type === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      onClick={closeMenu}
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getAvatarInitials()}
                      </div>
                      <span className="font-medium text-gray-700">View Profile</span>
                    </Link>
                    <button 
                      onClick={() => { logout(); closeMenu(); navigate('/');}} 
                      className="w-full px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setModalVisible(true); closeMenu(); }}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Donor Login
                    </button>
                    <Link 
                      to="/hospital-login" 
                      onClick={closeMenu} 
                      className="block w-full px-4 py-3 text-sm font-medium text-white text-center bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      Hospital Login
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {!isAuthenticated && (
        <DonorLoginModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} />
      )}
    </>
  );
}

export default Header;