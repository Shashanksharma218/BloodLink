import React from 'react';
import { Link } from 'react-router-dom';

const SuccessIcon = () => (
    <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
);

function RegistrationSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center py-12 px-6">
      <div className="card-modern p-10 md:p-16 max-w-2xl w-full text-center animate-fade-in-up">
        <SuccessIcon />
        
        <div className="space-y-6">
          <h1 className="text-heading text-gray-900">Thank You for Registering!</h1>
          <p className="text-body text-gray-600 max-w-lg mx-auto">
            You are now a part of the BloodLink community. Your willingness to donate can save lives. You can now log in using your registered email from the homepage.
          </p>
          
          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">You'll receive notifications for urgent blood requests</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Access your donor dashboard anytime</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Track your donation history and impact</span>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="pt-6">
            <Link 
              to="/"
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Back to Home
            </Link>
          </div>
          
          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? <Link to="/contact" className="text-red-600 hover:text-red-700 hover:underline font-medium">Contact us</Link> for any questions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegistrationSuccessPage;
