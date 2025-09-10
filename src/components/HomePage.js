import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import heroIllustration from "url:../assets/hero-illustration.png";
import registerIcon from "url:../assets/register-icon.jpg";
import notifyIcon from "url:../assets/notify-icon.svg";
import donateIcon from "url:../assets/donate-icon.png";
import donationIllustration from "url:../assets/donation-illustration.png"

function HomePage() {
  const [selectedGroup, setSelectedGroup] = useState("A+");

  const bloodData = {
    "A+": { take: ["O+", "O-", "A+", "A-"], give: ["A+", "AB+"] },
    "A-": { take: ["O-", "A-"], give: ["A+", "A-", "AB+", "AB-"] },
    "B+": { take: ["O+", "O-", "B+", "B-"], give: ["B+", "AB+"] },
    "B-": { take: ["O-", "B-"], give: ["B+", "B-", "AB+", "AB-"] },
    "AB+": { take: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"], give: ["AB+"] },
    "AB-": { take: ["O-", "A-", "B-", "AB-"], give: ["AB+", "AB-"] },
    "O+": { take: ["O+", "O-"], give: ["O+", "A+", "B+", "AB+"] },
    "O-": { take: ["O-"], give: ["Everyone"] },
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="container mx-auto px-6 md:px-20 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight">
              Donate Blood, <br />
              Save Lives.
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
              Welcome to BloodLink Una, a platform connecting voluntary blood donors with Government Hospital, Una. Your single donation can save up to three lives.
            </p>
            <div className="flex justify-center md:justify-start space-x-4 pt-4">
              <Link
                to="/register-donor"
                className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Register as a Donor
              </Link>
              <Link
                to="/hospital-login"
                className="bg-gray-100 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                Hospital Login
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img src={heroIllustration} alt="Blood Donation Illustration" className="w-full h-auto max-w-lg" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 md:px-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Our process is simple, secure, and designed to make a real impact.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
              <img src={registerIcon} alt="Register" className="h-24 w-24 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Register Yourself</h3>
              <p className="text-gray-600">
                Create a donor profile with your details and blood group in just a few minutes.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
              <img src={notifyIcon} alt="Get Notified" className="h-24 w-24 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Get Notified</h3>
              <p className="text-gray-600">
                Receive a request from the hospital when there is an urgent need for your blood type.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
              <img src={donateIcon} alt="Donate Blood" className="h-24 w-24 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Save a Life</h3>
              <p className="text-gray-600">
                Accept the request, visit the hospital, and make a life-saving donation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn About Donation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Learn About Donation
          </h2>
          

          {/* Blood Group Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {Object.keys(bloodData).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-5 py-2 rounded-md border text-lg font-bold ${selectedGroup === group
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
              >
                {group}
              </button>
            ))}
          </div>

          <h3 className="text-gray-700 mb-4 text-center">
            Select your Blood type
          </h3>

          {/* 2 Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 items-center w-8/12 mx-auto">

            {/* Left: Blood Info */}
            <div className="flex flex-col items-left space-y-6 ">
              <h3 className="font-semibold text-gray-800 mb-2">You can take from:</h3>
              <div className="bg-gray-50 shadow-sm p-6 rounded-xl border max-w-sm w-full">
                <p className="text-gray-700">{bloodData[selectedGroup].take.join(", ")}</p>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">You can give to:</h3>
              <div className="bg-gray-50 shadow-sm p-6 rounded-xl border max-w-sm w-full mb-8">
                <p className="text-gray-700">{bloodData[selectedGroup].give.join(", ")}</p>
              </div>
            </div>

            {/* Right: Illustration + Message */}
            <div className="flex flex-col items-center">
              <img
                src={donationIllustration} // replace with your illustration
                alt="Blood Donation Illustration"
                className="w-full max-w-sm"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                One blood donation can save up to{" "}
                <span className="text-red-600 font-bold">three lives</span>.
              </p>
            </div>
          </div>
        </div>
      </section>



    </main>
  );
}

export default HomePage;
