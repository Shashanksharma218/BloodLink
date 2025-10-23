// frontend/src/components/DonorDashboardPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react'; // Added icon for refresh button

function DonorDashboardPage() {
  const { currentUser, refreshCurrentUser } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Added 'history' tab
  const [activeRequestTab, setActiveRequestTab] = useState('upcoming'); 

  useEffect(() => {
    if (currentUser) {
      setIsAvailable(currentUser.isAvailable);
    }
  }, [currentUser]);

  // NEW HELPER: Generates a random placeholder phone number
  const getHospitalContact = useCallback(() => {
    // Placeholder number in a common Indian format +91 987 654 XXXX
    const lastFour = Math.floor(1000 + Math.random() * 9000);
    return "+91 987 654 " + lastFour;
  }, []);

  const fetchRequests = useCallback(async () => {
    if (currentUser?._id) {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5555/api/requests/donor`, {credentials: 'include'});
        if (!response.ok) {
          throw new Error('Failed to fetch your donation requests.');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestAction = async (requestId, action) => {
    let newStatus;
    let remarks = '';
    
    if (action === 'accept') {
      newStatus = 'Donor Accepted';
    } else if (action === 'reject') {
      newStatus = 'Donor Rejected';
      // Use window.prompt as a placeholder for a custom modal
      // NOTE: In a production environment, replace this with a styled modal UI 
      const rejectionReason = prompt("Please provide a brief reason for rejecting this request:");
      if (rejectionReason === null) return; // User cancelled prompt
      remarks = rejectionReason || 'Rejected by donor.';
    } else {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5555/api/requests/${requestId}/status/donor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // NEW: Send status and remarks
        body: JSON.stringify({ status: newStatus, remarks: remarks }),
        credentials: 'include' 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status.');
      }
      
      const updatedRequest = await response.json();

      // Update the requests state with the new status and remarks
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? { ...req, status: updatedRequest.status, remarks: updatedRequest.remarks } : req
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };
  
  const handleAvailabilityToggle = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability); 

    try {
      const response = await fetch(`http://localhost:5555/api/donors/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
        credentials: 'include'
      });

      if (!response.ok) {
        setIsAvailable(!newAvailability); 
        throw new Error('Failed to update your availability status. Please try again.');
      }
      
      await refreshCurrentUser();
      
    } catch (err) {
      setIsAvailable(!newAvailability);
      alert(err.message);
    }
  };
  
  // NEW Status Filtering
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const upcomingDonations = requests.filter(req => req.status === 'Donor Accepted' || req.status === 'Visit Scheduled');
  const historyRequests = requests.filter(req => 
    req.status === 'Donation Completed' || 
    req.status === 'Donor Rejected' || 
    req.status === 'Donation Rejected' // Hospital rejection
  );
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Donor Accepted': return 'bg-blue-100 text-blue-800';
      case 'Visit Scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'Donation Completed': return 'bg-green-100 text-green-800';
      case 'Donor Rejected':
      case 'Donation Rejected': return 'bg-red-100 text-red-800'; // Both donor/hospital rejection are red
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (!currentUser) {
    return <p className="text-center text-gray-500 py-20">Loading your dashboard...</p>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        {/* Compact Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back, <span className="text-red-600">{currentUser.fullName}</span>
              </h1>
              <p className="text-sm text-gray-600">Manage your donations and help save lives</p>
            </div>
            <button 
              onClick={refreshCurrentUser} 
              title="Refresh your profile data"
              className="btn-outline text-sm py-2 px-3 flex items-center gap-2"
            >
              <RefreshCw size={16} className="text-red-600"/>
              Refresh
            </button>
          </div>
        </div>

        {/* Compact Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-modern p-4 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAvailable ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
                  <p className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                    {isAvailable ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAvailabilityToggle}
                className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex items-center h-5 rounded-full w-9 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                <span className={`${isAvailable ? 'translate-x-5' : 'translate-x-0.5'} inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-300`} />
              </button>
            </div>
          </div>

          <div className="card-modern p-4 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Last Donation</h3>
                <p className="text-xs text-gray-600">
                  {currentUser.lastDonationDate ? new Date(currentUser.lastDonationDate).toLocaleDateString() : 'Not Recorded'}
                </p>
              </div>
            </div>
          </div>

          <div className="card-modern p-4 hover-lift">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Blood Group</h3>
                <p className="text-xs text-gray-600">{currentUser.bloodGroup}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Donation Requests Section */}
        <div className="card-modern">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Donation Requests</h2>
              <button 
                onClick={fetchRequests} 
                className="btn-outline text-sm py-2 px-3 flex items-center gap-2"
              >
                <RefreshCw size={16} className="text-red-600"/>
                Refresh
              </button>
            </div>
          </div>

          <nav className="flex border-b border-gray-200 px-4 overflow-x-auto">
            <button 
              onClick={() => setActiveRequestTab('upcoming')} 
              className={`py-3 px-1 border-b-2 font-medium transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'upcoming' 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                Upcoming
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {upcomingDonations.length}
                </span>
              </span>
            </button>
            <button 
              onClick={() => setActiveRequestTab('available')} 
              className={`ml-6 py-3 px-1 border-b-2 font-medium transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'available' 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                Available
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              </span>
            </button>
            <button 
              onClick={() => setActiveRequestTab('history')} 
              className={`ml-6 py-3 px-1 border-b-2 font-medium transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'history' 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                History
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {historyRequests.length}
                </span>
              </span>
            </button>
          </nav>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center mb-4">
                  <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-body text-gray-600">Loading your requests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg animate-fade-in-up">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* --- Available Requests (Pending) --- */}
                {activeRequestTab === 'available' && (
                  pendingRequests.length > 0 ? (
                    pendingRequests.map(request => (
                      <div key={request._id} className="card-modern p-4 border-l-4 border-red-500 hover-lift">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{request.bloodGroup}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Urgency: <span className="text-red-600">{request.urgency}</span></p>
                                <p className="text-xs text-gray-500">Sent: {new Date(request.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg mb-3">
                              <p className="text-xs text-red-700 font-semibold">
                                <span className="font-bold">Deadline:</span> {new Date(request.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            
                            {/* Hospital Contact */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-700">Contact: </span>
                                <a 
                                  href={`tel:${getHospitalContact()}`} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                                >
                                  {getHospitalContact()}
                                </a>
                              </div>
                            </div>
                            
                            {request.note && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-700">
                                  <span className="font-semibold">Note:</span> {request.note}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => handleRequestAction(request._id, 'accept')} 
                              className="btn-primary py-2 px-4 text-xs font-semibold"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRequestAction(request._id, 'reject')} 
                              className="btn-outline py-2 px-4 text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-body text-gray-500">You have no new donation requests.</p>
                    </div>
                  )
                )}

                {/* --- Upcoming Donations (Donor Accepted or Visit Scheduled) --- */}
                {activeRequestTab === 'upcoming' && (
                  upcomingDonations.length > 0 ? (
                    upcomingDonations.map(request => (
                      <div key={request._id} className="card-modern p-4 border-l-4 border-blue-500 hover-lift">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{request.bloodGroup}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Urgency: <span className="text-blue-600">{request.urgency}</span></p>
                                <p className="text-xs text-gray-500">Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg mb-3">
                              <p className="text-xs text-blue-700 font-semibold">
                                <span className="font-bold">Deadline:</span> {new Date(request.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            
                            {/* Hospital Contact */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-700">Contact: </span>
                                <a 
                                  href={`tel:${getHospitalContact()}`} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                                >
                                  {getHospitalContact()}
                                </a>
                              </div>
                            </div>
                            
                            {request.note && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-xs text-gray-700">
                                  <span className="font-semibold">Note:</span> {request.note}
                                </p>
                              </div>
                            )}
                            {request.status === 'Visit Scheduled' && (
                              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200">
                                <p className="text-xs text-indigo-700 font-semibold">
                                  <span className="font-bold">Action Required:</span> The hospital expects your visit!
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-body text-gray-500">You have no upcoming donations scheduled.</p>
                    </div>
                  )
                )}

                {/* --- Donation History (Completed or Rejected) --- */}
                {activeRequestTab === 'history' && (
                  historyRequests.length > 0 ? (
                    historyRequests.map(request => (
                      <div key={request._id} className={`card-modern p-4 border-l-4 ${request.status === 'Donation Completed' ? 'border-green-500' : 'border-red-500'} hover-lift`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${request.status === 'Donation Completed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                                <span className="text-lg font-bold text-white">{request.bloodGroup}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Urgency: <span className="font-bold">{request.urgency}</span></p>
                                <p className="text-xs text-gray-500">Finalized: {new Date(request.updatedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg mb-3 ${request.status === 'Donation Completed' ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}>
                              <p className={`text-xs font-semibold ${request.status === 'Donation Completed' ? 'text-green-700' : 'text-red-700'}`}>
                                <span className="font-bold">Deadline:</span> {new Date(request.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            
                            {/* Hospital Contact */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-700">Contact: </span>
                                <a 
                                  href={`tel:${getHospitalContact()}`} 
                                  className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                                >
                                  {getHospitalContact()}
                                </a>
                              </div>
                            </div>
                            
                            {(request.note || request.remarks) && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-700">
                                  <span className="font-semibold">{request.remarks ? 'Remarks:' : 'Note:'}</span> {request.remarks || request.note}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-body text-gray-500">Your donation history is currently empty.</p>
                    </div>
                  )
                )}
             </div>
           )}
         </div>
       </div>
      </div>
    </main>
  );
}

export default DonorDashboardPage;
