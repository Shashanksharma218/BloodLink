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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, <span className="text-red-600">{currentUser.fullName}</span>
          </h1>
           <button 
            onClick={refreshCurrentUser} 
            title="Refresh your profile data"
            className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <RefreshCw size={18} className="text-red-600"/>
            Refresh Profile
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Availability Status</h3>
                <p className={`text-base font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAvailable ? 'Available to Donate' : 'Not Available'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAvailabilityToggle}
                className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                <span className={`${isAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Last Donation Date</h3>
            <p className="text-base text-gray-600 font-medium">
              {currentUser.lastDonationDate ? new Date(currentUser.lastDonationDate).toLocaleDateString() : 'Not Recorded'}
            </p>
          </div>
        </div>
        
        {/* Donation Requests Section */}
        <div className="bg-white rounded-lg shadow">
         <div className="p-6 border-b border-gray-200">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold text-gray-800">My Donation Requests</h2>
             <button 
               onClick={fetchRequests} 
               className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
             >
               <RefreshCw size={18} className="text-red-600"/>
               Refresh Requests
             </button>
           </div>
         </div>

         <nav className="flex border-b border-gray-200 px-6 overflow-x-auto">
           <button 
             onClick={() => setActiveRequestTab('upcoming')} 
             className={`py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
               activeRequestTab === 'upcoming' 
                 ? 'border-red-600 text-red-600' 
                 : 'border-transparent text-gray-600 hover:text-gray-800'
             }`}
           >
             <span className="flex items-center gap-2">
               Upcoming Donations
               <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                 {upcomingDonations.length}
               </span>
             </span>
           </button>
           <button 
             onClick={() => setActiveRequestTab('available')} 
             className={`ml-8 py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
               activeRequestTab === 'available' 
                 ? 'border-red-600 text-red-600' 
                 : 'border-transparent text-gray-600 hover:text-gray-800'
             }`}
           >
             <span className="flex items-center gap-2">
               Available Requests
               <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                 {pendingRequests.length}
               </span>
             </span>
           </button>
           <button 
             onClick={() => setActiveRequestTab('history')} 
             className={`ml-8 py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
               activeRequestTab === 'history' 
                 ? 'border-red-600 text-red-600' 
                 : 'border-transparent text-gray-600 hover:text-gray-800'
             }`}
           >
             <span className="flex items-center gap-2">
               Donation History
               <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                 {historyRequests.length}
               </span>
             </span>
           </button>
         </nav>

         <div className="p-6">
           {isLoading ? (
             <div className="text-center py-12">
               <p className="text-gray-600">Loading your requests...</p>
             </div>
           ) : error ? (
             <div className="text-center py-12">
               <p className="text-red-600">{error}</p>
             </div>
           ) : (
             <div className="space-y-4">
               {/* --- Available Requests (Pending) --- */}
               {activeRequestTab === 'available' && (
                 pendingRequests.length > 0 ? (
                   pendingRequests.map(request => (
                     <div key={request._id} className="border-l-4 border-red-600 bg-white border border-gray-200 rounded-lg p-5">
                       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                         <div className="flex-1">
                           <div className="flex items-center gap-4 mb-3">
                             <span className="text-2xl font-bold text-red-600">{request.bloodGroup}</span>
                             <div>
                               <p className="font-semibold text-gray-800">Urgency: <span className="text-red-600">{request.urgency}</span></p>
                               <p className="text-sm text-gray-500">Sent: {new Date(request.createdAt).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <p className="text-sm text-red-600 font-semibold mb-2">
                               Deadline: {new Date(request.deadline).toLocaleDateString()}
                           </p>
                           
                           {/* NEW: Hospital Contact */}
                           <p className="text-sm text-gray-700 mt-2">
                               <span className="font-semibold">Hospital Contact: </span>
                               <a 
                                 href={`tel:${getHospitalContact()}`} 
                                 className="text-blue-600 hover:underline font-medium"
                               >
                                 {getHospitalContact()}
                               </a>
                           </p>
                           
                           {request.note && (
                             <p className="text-sm text-gray-600 mt-2">
                               <span className="font-medium">Note from Hospital:</span> {request.note}
                             </p>
                           )}
                         </div>
                         <div className="flex gap-3">
                           <button 
                             onClick={() => handleRequestAction(request._id, 'accept')} 
                             className="bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                           >
                             Accept
                           </button>
                           <button 
                             onClick={() => handleRequestAction(request._id, 'reject')} 
                             className="bg-gray-600 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                           >
                             Reject
                           </button>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12">
                     <p className="text-gray-500">You have no new donation requests.</p>
                   </div>
                 )
               )}

               {/* --- Upcoming Donations (Donor Accepted or Visit Scheduled) --- */}
               {activeRequestTab === 'upcoming' && (
                 upcomingDonations.length > 0 ? (
                   upcomingDonations.map(request => (
                     <div key={request._id} className="border-l-4 border-blue-600 bg-white border border-gray-200 rounded-lg p-5">
                       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                         <div className="flex-1">
                           <div className="flex items-center gap-4 mb-3">
                             <span className="text-2xl font-bold text-blue-600">{request.bloodGroup}</span>
                             <div>
                               <p className="font-semibold text-gray-800">Urgency: <span className="text-blue-600">{request.urgency}</span></p>
                               <p className="text-sm text-gray-500">Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <p className="text-sm text-red-600 font-semibold mb-2">
                               Deadline: {new Date(request.deadline).toLocaleDateString()}
                           </p>
                           
                           {/* NEW: Hospital Contact */}
                           <p className="text-sm text-gray-700 mt-2">
                               <span className="font-semibold">Hospital Contact: </span>
                               <a 
                                 href={`tel:${getHospitalContact()}`} 
                                 className="text-blue-600 hover:underline font-medium"
                               >
                                 {getHospitalContact()}
                               </a>
                           </p>
                           
                           {request.note && (
                             <p className="text-sm text-gray-600 mt-2">
                               <span className="font-medium">Note from Hospital:</span> {request.note}
                             </p>
                           )}
                           {request.status === 'Visit Scheduled' && (
                                <p className="text-sm text-indigo-700 mt-2 font-medium">
                                    <span className="font-semibold">Action Required:</span> The hospital expects your visit!
                                </p>
                           )}
                         </div>
                         <div>
                           <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                             {request.status}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12">
                     <p className="text-gray-500">You have no upcoming donations scheduled.</p>
                   </div>
                 )
               )}

               {/* --- Donation History (Completed or Rejected) --- */}
               {activeRequestTab === 'history' && (
                 historyRequests.length > 0 ? (
                   historyRequests.map(request => (
                     <div key={request._id} className={`border-l-4 ${request.status === 'Donation Completed' ? 'border-green-600' : 'border-red-600'} bg-white border border-gray-200 rounded-lg p-5`}>
                       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                         <div className="flex-1">
                           <div className="flex items-center gap-4 mb-3">
                             <span className="text-2xl font-bold text-gray-800">{request.bloodGroup}</span>
                             <div>
                               <p className="font-semibold text-gray-800">Urgency: {request.urgency}</p>
                               <p className="text-sm text-gray-500">Finalized: {new Date(request.updatedAt).toLocaleDateString()}</p>
                             </div>
                           </div>
                           <p className="text-sm text-gray-600 font-semibold mb-2">
                               Deadline: {new Date(request.deadline).toLocaleDateString()}
                           </p>
                           
                           {/* NEW: Hospital Contact */}
                           <p className="text-sm text-gray-700 mt-2">
                               <span className="font-semibold">Hospital Contact: </span>
                               <a 
                                 href={`tel:${getHospitalContact()}`} 
                                 className="text-blue-600 hover:underline font-medium"
                               >
                                 {getHospitalContact()}
                               </a>
                           </p>
                           
                           {(request.note || request.remarks) && (
                             <p className="text-sm text-gray-600 mt-2">
                               <span className="font-medium">{request.remarks ? 'Remarks:' : 'Note:'}</span> {request.remarks || request.note}
                             </p>
                           )}
                         </div>
                         <div>
                           <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                             {request.status}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12">
                     <p className="text-gray-500">Your donation history is currently empty.</p>
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
