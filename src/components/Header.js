import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DonorLoginModal from './DonorLoginModal'; // Import the modal
import bloodIcon from "url:../assets/blood-drop.png";

function Header() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false); // State for mobile menu toggle

  const navLinkStyles = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#dc2626' : '#4b5563',
  });

  // Function to close the menu, useful for link clicks
  const closeMenu = () => setMenuOpen(false);

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

          {/* Mobile Menu Button (Hamburger Icon) */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)} 
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 rounded"
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

          {/* Navigation Links & Buttons Container */}
          <nav className={`
            ${isMenuOpen ? 'flex' : 'hidden'} 
            md:flex 
            flex-col md:flex-row md:items-center md:space-x-8
            absolute md:static top-full left-0 w-full md:w-auto
            bg-white md:bg-transparent
            border-b md:border-none border-gray-100
            shadow-md md:shadow-none
            p-6 md:p-0
            space-y-4 md:space-y-0
          `}>
            {/* Navigation Links */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 font-medium text-gray-600">
              <NavLink to="/" style={navLinkStyles} className="hover:text-red-600 transition-colors" onClick={closeMenu}>Home</NavLink>
              <NavLink to="/about" style={navLinkStyles} className="hover:text-red-600 transition-colors" onClick={closeMenu}>About</NavLink>
              <NavLink to="/contact" style={navLinkStyles} className="hover:text-red-600 transition-colors" onClick={closeMenu}>Contact Us</NavLink>
            </div>
            
            {/* Login Buttons */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 pt-4 md:pt-0 mt-4 md:mt-0 border-t md:border-none border-gray-100">
              <button 
                onClick={() => {
                  setModalVisible(true);
                  closeMenu(); // Close menu when opening modal
                }}
                className="bg-red-50 text-red-600 font-medium py-2 px-5 rounded-lg hover:bg-red-100 transition-colors duration-200 text-center"
              >
                Donor Login
              </button>
              <Link to="/hospital-login" onClick={closeMenu} className="bg-red-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-200 text-center">
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