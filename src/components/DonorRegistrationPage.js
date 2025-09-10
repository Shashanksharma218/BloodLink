import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// You can find a suitable illustration for this page.
// Search on unDraw for "Personal information" or "Health".
import formIllustration from 'url:../assets/form-illustration.svg'; 

function DonorRegistrationPage() {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <main className="bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Form */}
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Become a Donor</h2>
            <p className="text-gray-600 mb-8">Join our community of lifesavers. Fill out the form below.</p>
            
            <form className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="fullName" name="fullName" placeholder="e.g., Shashank Sharma" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
              </div>

              {/* Contact & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input type="tel" id="contact" name="contact" placeholder="10-digit mobile number" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address </label>
                  <input type="email" id="email" name="email" placeholder="you@example.com" className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>

              {/* Blood Group & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select id="bloodGroup" name="bloodGroup" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500">
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender </label>
                  <select id="gender" name="gender" className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="location" name="location" placeholder="e.g., Una, Himachal Pradesh" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-700">Set Availability Status</span>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                >
                  <span className={`${isAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg"
                >
                  Register Now
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration & Text */}
          <div className="hidden md:flex flex-col items-center text-center">
            <img src={formIllustration} alt="Donor Registration Illustration" className="w-full max-w-md mb-8" />
            <h3 className="text-2xl font-bold text-gray-800">Thank You for Your Willingness to Help!</h3>
            <p className="text-gray-600 mt-2 max-w-sm">Your registration is the first step towards saving a life. We appreciate your commitment.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DonorRegistrationPage;
