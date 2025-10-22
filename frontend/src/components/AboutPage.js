import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

// Illustration from unDraw, search for "community" or "mission"
import aboutIllustration from 'url:../assets/about-illustration.svg';

function AboutPage() {
  const { isAuthenticated } = useAuth(); // 2. Get the authentication state

  return (
    <div className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-20">
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Left Column: Illustration */}
          <div className="flex justify-center mb-10 md:mb-0">
            <img 
              src={aboutIllustration} 
              alt="Community of blood donors" 
              className="w-full max-w-sm md:max-w-md"
            />
          </div>

          {/* Right Column: Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              About BloodLink
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connecting Donors, Saving Lives in Himachal Pradesh.
            </p>

            <div className="space-y-6">
              {/* Mission Section */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  To create a seamless and reliable digital platform that connects voluntary blood donors with Government Hospital, Una, ensuring a timely and adequate supply of blood for patients in need. We aim to bridge the gap between donors and recipients through technology, making the process of blood donation simple, efficient, and accessible for everyone in our community.
                </p>
              </div>

              {/* Vision Section */}
              <div className="bg-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  To build a future where no life is lost due to a shortage of blood in Una. We envision a strong, self-sufficient community of registered donors who are ready to step up and make a life-saving difference, fostering a culture of voluntary blood donation and community service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Conditionally render the Call to Action section */}
        {!isAuthenticated && (
          <div className="text-center bg-red-50 p-8 md:p-12 rounded-xl mt-16 md:mt-20 border border-red-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Join Our Community of Lifesavers</h3>
            <p className="text-gray-600 mt-4 mb-8 max-w-2xl mx-auto">
              Your decision to donate blood can save up to three lives. Become a part of our mission today.
            </p>
            <Link 
              to="/register-donor"
              className="bg-red-600 text-white font-bold py-3 px-8 sm:px-10 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Register as a Donor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutPage;
