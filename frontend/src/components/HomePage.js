import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import heroIllustration from "url:../assets/hero-illustration.png";
import registerIcon from "url:../assets/register-icon.jpg";
import notifyIcon from "url:../assets/notify-icon.svg";
import donateIcon from "url:../assets/donate-icon.png";
import donationIllustration from "url:../assets/donation-illustration.png"

function HomePage() {
  const [selectedGroup, setSelectedGroup] = useState("A+");
  const { isAuthenticated } = useAuth();

  const bloodData = {
    "A+": { take: ["O+", "O-", "A+", "A-"], give: ["A+", "AB+"] },
    "A-": { take: ["O-", "A-"], give: ["A+", "A-", "AB+", "AB-"] },
    "B+": { take: ["O+", "O-", "B+", "B-"], give: ["B+", "AB+"] },
    "B-": { take: ["O-", "B-"], give: ["B+", "B-", "AB+", "AB-"] },
    "AB+": { take: ["Any"], give: ["AB+"] },
    "AB-": { take: ["O-", "A-", "B-", "AB-"], give: ["AB+", "AB-"] },
    "O+": { take: ["O+", "O-"], give: ["O+", "A+", "B+", "AB+"] },
    "O-": { take: ["O-"], give: ["Any"] },
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50 py-8 md:py-12 lg:py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23dc2626%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10 w-full lg:py-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col justify-center text-center md:text-left space-y-6 order-2 md:order-1 animate-fade-in-left">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  Donate Blood, <br />
                  <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    Save Lives.
                  </span>
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
                  Welcome to BloodLink Una, a platform connecting voluntary blood donors with Government Hospital, Una. Your single donation can save up to three lives.
                </p>
              </div>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
                  <Link
                    to="/register-donor"
                    className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 animate-glow"
                  >
                    Register as a Donor
                  </Link>
                  <Link
                    to="/hospital-login"
                    className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                  >
                    Hospital Login
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-black text-red-600">500+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Lives Saved</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-black text-red-600">200+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Active Donors</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-black text-red-600">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Emergency Service</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center order-1 md:order-2 animate-fade-in-right">
              <div className="relative">
                <img src={heroIllustration} alt="Blood Donation Illustration" className="w-full h-auto max-w-lg animate-float" />
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-base md:text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Our process is simple, secure, and designed to make a real impact. Join thousands of lifesavers who have made a difference.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-modern p-6 md:p-8 hover-lift animate-fade-in-up group" style={{animationDelay: '0.1s'}}>
              <div className="relative mb-6">
                <img src={registerIcon} alt="Register" className="h-16 md:h-20 w-16 md:w-20 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Register Yourself</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Create a donor profile with your details and blood group in just a few minutes. Join our community of lifesavers.
              </p>
            </div>
            
            <div className="card-modern p-6 md:p-8 hover-lift animate-fade-in-up group" style={{animationDelay: '0.2s'}}>
              <div className="relative mb-6">
                <img src={notifyIcon} alt="Get Notified" className="h-16 md:h-20 w-16 md:w-20 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Get Notified</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Receive a request from the hospital when there is an urgent need for your blood type. Be the hero someone needs.
              </p>
            </div>
            
            <div className="card-modern p-6 md:p-8 hover-lift animate-fade-in-up group" style={{animationDelay: '0.3s'}}>
              <div className="relative mb-6">
                <img src={donateIcon} alt="Donate Blood" className="h-16 md:h-20 w-16 md:w-20 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Save a Life</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Accept the request, visit the hospital, and make a life-saving donation. Your courage saves lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn About Donation Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Learn About Donation
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Select your blood type to see who you can give to and receive from. Understanding compatibility helps save more lives.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up">
            {Object.keys(bloodData).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                  selectedGroup === group
                    ? "gradient-primary text-white shadow-colored"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-modern"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
            {/* Information Card */}
            <div className="card-modern p-6 md:p-8 animate-fade-in-left">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center md:text-left">You can receive blood from:</h3>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-green-800 font-bold text-base text-center md:text-left">{bloodData[selectedGroup].take.join(", ")}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center md:text-left">You can give blood to:</h3>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <p className="text-red-800 font-bold text-base text-center md:text-left">{bloodData[selectedGroup].give.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex flex-col items-center justify-center animate-fade-in-right">
              <div className="relative">
                <img
                  src={donationIllustration}
                  alt="Blood Donation Illustration"
                  className="w-full max-w-xs lg:max-w-sm animate-float"
                />
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-base animate-pulse">
                  ♥
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-base md:text-lg text-gray-600">
                  One blood donation can save up to{" "}
                  <span className="text-red-600 font-black text-lg">three lives</span>.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Be a hero. Donate blood today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      {!isAuthenticated && (
        <section className="py-16 md:py-20 bg-gradient-to-r from-red-600 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 text-center relative z-10">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Make a Difference?</h2>
              <p className="text-base md:text-lg text-red-100 mb-10 max-w-2xl mx-auto">
                Join our community of lifesavers and help ensure that no life is lost due to blood shortage in Una.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/register-donor"
                  className="bg-white text-red-600 font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-modern-lg text-base md:text-lg"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default HomePage;