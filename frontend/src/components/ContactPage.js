import React from 'react';

import contactIllustration from 'url:../assets/contact-illustration.svg';

function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
          
          {/* Left Column: Contact Form */}
          <div className="card-modern p-8 md:p-10 order-2 md:order-1 animate-fade-in-left">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-heading text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-body text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
            
            <form className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Your Name" 
                    required 
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    required 
                    className="input-modern"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  placeholder="How can we help?" 
                  required 
                  className="input-modern"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  placeholder="Your message..." 
                  required 
                  className="input-modern resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Illustration & Contact Info */}
          <div className="flex flex-col items-center text-center md:text-left md:items-start order-1 md:order-2 animate-fade-in-right">
            <div className="text-center md:text-left mb-8">
              <h1 className="text-display text-gray-900 mb-6">Get in Touch</h1>
              <p className="text-body text-gray-600 max-w-2xl mx-auto md:mx-0">
                We are here to help. Whether you have a question about donations, the registration process, or anything else, our team is ready to answer all your questions.
              </p>
            </div>
            
            <div className="relative mb-8">
              <img src={contactIllustration} alt="Contact Us Illustration" className="w-full max-w-sm mx-auto animate-float" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="space-y-6 text-left w-full max-w-md">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-modern">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">Govt. Hospital, Una, Himachal Pradesh, 174303</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-modern">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <a href="mailto:contact@bloodlinkuna.in" className="text-red-600 hover:text-red-700 hover:underline font-medium">
                    contact@bloodlinkuna.in
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-modern">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Emergency Service</h3>
                  <p className="text-gray-600">24/7 Available</p>
                  <p className="text-sm text-gray-500">Please visit the hospital for urgent needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
