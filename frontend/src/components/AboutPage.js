import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import aboutIllustration from 'url:../assets/about-illustration.svg';

function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-20">
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center max-w-7xl mx-auto">
          
          {/* Left Column: Illustration */}
          <div className="flex justify-center mb-10 md:mb-0 animate-fade-in-left">
            <div className="relative">
              <img 
                src={aboutIllustration} 
                alt="Community of blood donors" 
                className="w-full max-w-sm md:max-w-md animate-float"
              />
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg animate-pulse">
                ♥
              </div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="text-center md:text-left animate-fade-in-right">
            <h1 className="text-display text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">BloodLink</span>
            </h1>
            <p className="text-body text-gray-600 mb-8">
              Connecting Donors, Saving Lives in Himachal Pradesh.
            </p>

            <div className="space-y-8">
              {/* Mission Section */}
              <div className="card-modern p-8 hover-lift">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-subheading text-gray-900 mb-3">Our Mission</h2>
                    <p className="text-gray-700 leading-relaxed">
                      To create a seamless and reliable digital platform that connects voluntary blood donors with Government Hospital, Una, ensuring a timely and adequate supply of blood for patients in need. We aim to bridge the gap between donors and recipients through technology, making the process of blood donation simple, efficient, and accessible for everyone in our community.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vision Section */}
              <div className="card-modern p-8 hover-lift">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-subheading text-gray-900 mb-3">Our Vision</h2>
                    <p className="text-gray-700 leading-relaxed">
                      To build a future where no life is lost due to a shortage of blood in Una. We envision a strong, self-sufficient community of registered donors who are ready to step up and make a life-saving difference, fostering a culture of voluntary blood donation and community service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 mb-16">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-heading text-gray-900 mb-4">Making a Real Impact</h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto">
              Our platform has connected donors with hospitals, saving countless lives across Himachal Pradesh.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-3xl font-black text-red-600 mb-2">500+</div>
              <div className="text-sm text-gray-600 font-medium">Lives Saved</div>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-3xl font-black text-blue-600 mb-2">200+</div>
              <div className="text-sm text-gray-600 font-medium">Active Donors</div>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-black text-green-600 mb-2">50+</div>
              <div className="text-sm text-gray-600 font-medium">Successful Donations</div>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-black text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Emergency Service</div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        {!isAuthenticated && (
          <div className="text-center bg-gradient-to-r from-red-600 to-red-700 p-8 md:p-12 rounded-2xl shadow-modern-xl animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-heading text-white mb-4">Join Our Community of Lifesavers</h3>
              <p className="text-body text-red-100 mb-8 max-w-2xl mx-auto">
                Your decision to donate blood can save up to three lives. Become a part of our mission today and help us build a stronger, healthier community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link 
                  to="/register-donor"
                  className="bg-white text-red-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-modern-lg text-lg"
                >
                  Register as a Donor
                </Link>
                <Link 
                  to="/contact"
                  className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutPage;
