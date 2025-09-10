import React from 'react';

// Find a suitable illustration on unDraw by searching for "contact" or "mail"
import contactIllustration from 'url:../assets/contact-illustration.svg';

function ContactPage() {
  return (
    <div className="bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-20">

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="fullName" name="fullName" placeholder="Your Name" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="you@example.com" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" id="subject" name="subject" placeholder="How can we help?" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="message" rows="5" placeholder="Your message..." required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105 shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration & Contact Info */}
          <div className="flex flex-col items-center text-center md:text-left md:items-start pt-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Get in Touch</h1>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                We are here to help. Whether you have a question about donations, the registration process, or anything else, our team is ready to answer all your questions.
              </p>
            </div>
            <img src={contactIllustration} alt="Contact Us Illustration" className="w-full max-w-sm mb-8 mx-auto" />
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Address:</span>
                <span>Govt. Hospital, Una, Himachal Pradesh, 174303</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Email:</span>
                <a href="mailto:contact@bloodlinkuna.in" className="text-red-600 hover:underline">contact@bloodlinkuna.in</a>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">Phone:</span>
                <span>(Please visit the hospital for urgent needs)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
