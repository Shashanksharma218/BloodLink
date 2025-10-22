import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Send, List, Users, Lock, MessageSquare, User, LogOut, ChevronDown } from 'lucide-react';

function HospitalDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('send-requests');
  const [allDonors, setAllDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [donorsError, setDonorsError] = useState('');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDonors, setSelectedDonors] = useState(new Set());
  const [urgency, setUrgency] = useState('Medium');
  const [note, setNote] = useState('');
  // NEW STATE: Deadline input
  const [deadline, setDeadline] = useState(''); 
  const [showSuccessPopup, setShowSuccessPopup] = useState({ show: false, message: '' });
  const selectAllCheckboxRef = useRef();
  const [donorsList, setDonorsList] = useState([]);
  const [donorsListError, setDonorsListError] = useState('');
  const [donorsListLoading, setDonorsListLoading] = useState(true);

  // NEW STATE: For managing modal/input for remarks
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRequestToUpdate, setCurrentRequestToUpdate] = useState(null);
  const [currentUpdateStatus, setCurrentUpdateStatus] = useState('');
  const [currentRemarks, setCurrentRemarks] = useState('');
  const [updateError, setUpdateError] = useState('');


  // Mock messages data
  const [messages] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'I would like to donate blood urgently.', date: '2025-10-20', read: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'What are the requirements for blood donation?', date: '2025-10-19', read: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', message: 'Can I schedule a donation appointment?', date: '2025-10-18', read: true },
  ]);

  // Mock hospital profile
  const [hospitalProfile, setHospitalProfile] = useState({
    name: 'City General Hospital',
    email: 'admin@cityhospital.com',
    phone: '+91 9876543210',
    address: '123 Medical Center Drive, Panipat, Haryana',
    license: 'HOS-2024-12345'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Helper to set the minimum date for the deadline input (tomorrow)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Set to tomorrow
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchDonorsList = async () => {
      try {
        setDonorsListError('');
        const response = await fetch('http://localhost:5555/api/donors/all');
        if (!response.ok) throw new Error('Failed to fetch donors list.');
        const data = await response.json();
        setDonorsList(data);
      } catch (error) {
        setDonorsListError(error.message);
      } finally {
        setDonorsListLoading(false);
      }
    }
    fetchDonorsList();
  }, [])

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch('http://localhost:5555/api/donors/available');
        if (!response.ok) throw new Error('Failed to fetch available donors.');
        const data = await response.json();
        setAllDonors(data);
      } catch (err) {
        setDonorsError(err.message);
      } finally {
        setDonorsLoading(false);
      }
    };
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5555/api/requests');
        if (!response.ok) throw new Error('Failed to fetch blood requests.');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setRequestsError(err.message);
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchDonors();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedBloodGroup) {
      setFilteredDonors(allDonors.filter(donor => donor.bloodGroup === selectedBloodGroup));
    } else {
      setFilteredDonors(allDonors);
    }
    setSelectedDonors(new Set());
  }, [selectedBloodGroup, allDonors]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = selectedDonors.size > 0 && selectedDonors.size < filteredDonors.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedDonors, filteredDonors]);

  const handleSelectDonor = (donorId) => {
    setSelectedDonors(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(donorId)) newSelection.delete(donorId);
      else newSelection.add(donorId);
      return newSelection;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDonorIds = new Set(filteredDonors.map(d => d._id));
      setSelectedDonors(allDonorIds);
    } else {
      setSelectedDonors(new Set());
    }
  };

  const handleShowSuccessPopup = (message) => {
    setShowSuccessPopup({ show: true, message });
    setTimeout(() => setShowSuccessPopup({ show: false, message: '' }), 3000);
  };

  const sendRequests = async (donorIds) => {
    if (donorIds.size === 0 || !selectedBloodGroup || !deadline) {
      // Use a custom message box instead of alert
      console.error("Please select a blood group, at least one donor, and a deadline.");
      // In a real app, use a modal/toast here. For now, we'll use a placeholder console error.
      alert("Please select a blood group, at least one donor, and a deadline.");
      return;
    }
    
    // NEW: Include deadline in the request body
    const requestBody = { 
        donorIds: Array.from(donorIds), 
        bloodGroup: selectedBloodGroup, 
        urgency, 
        note,
        deadline 
    };
    
    try {
      const response = await fetch('http://localhost:5555/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send requests.');
      }
      const newRequests = await response.json();
      const populatedNewRequests = newRequests.requests.map(req => ({
        ...req,
        // Find the donor object from allDonors state for UI display
        donor: allDonors.find(d => d._id === req.donor) 
      }));
      setRequests(prev => [...populatedNewRequests, ...prev]);
      handleShowSuccessPopup('Request Sent Successfully!');
      setSelectedBloodGroup('');
      setUrgency('Medium');
      setNote('');
      setDeadline(''); // Clear deadline after sending
      setSelectedDonors(new Set()); // Clear selection
      setActivePage('view-requests');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelRequest = async (requestId) => {
    // In a real app, use a modal for confirmation
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const response = await fetch(`http://localhost:5555/api/requests/${requestId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel request.');
      }
      setRequests(prev => prev.filter(req => req._id !== requestId));
      handleShowSuccessPopup('Request Cancelled!');
    } catch (err) {
      alert(err.message);
    }
  };
  
  // NEW: Refactored API call into its own function
  const updateRequestStatusAPI = async (requestId, status, remarks = '') => {
    try {
        const response = await fetch(`http://localhost:5555/api/requests/${requestId}/status/hospital`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, remarks }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update status to ${status}.`);
        }
        
        const updatedRequest = await response.json();
        
        // Update the requests state
        setRequests(prev => prev.map(req => 
            req._id === requestId ? { ...req, status: updatedRequest.status, remarks: updatedRequest.remarks } : req
        ));
        
        handleShowSuccessPopup(`Request status updated to ${updatedRequest.status}!`);
        setUpdateError('');
        return true;
    } catch (err) {
        setUpdateError(err.message);
        return false;
    }
  };
  
  // NEW: Function to prepare for status update that requires remarks
  const initiateStatusUpdate = (request, status) => {
    setCurrentRequestToUpdate(request);
    setCurrentUpdateStatus(status);
    setCurrentRemarks(request.remarks || ''); // Pre-populate if available
    setUpdateError('');
    setShowRemarksModal(true);
  };
  
  // NEW: Comprehensive function to handle all hospital status updates
  const handleStatusUpdateByHospital = async (request, status, remarks = '') => {
    
    if (status === 'Visit Scheduled') {
      // Direct update for status that does NOT require remarks
      await updateRequestStatusAPI(request._id, status, remarks);
      return;
    }

    // --- Logic for status requiring remarks (Rejected/Completed) ---
    
    // Check if the call is coming from the modal (where currentRequestToUpdate is set)
    if (!request) {
        request = currentRequestToUpdate;
        remarks = currentRemarks;
    }

    if (!request || !status) return;

    // Remarks is mandatory for Donation Rejected and Donation Completed
    if ((status === 'Donation Rejected' || status === 'Donation Completed') && (!remarks || remarks.trim() === '')) {
        setUpdateError('Remarks are required for this status change.');
        return;
    }
    
    const success = await updateRequestStatusAPI(request._id, status, remarks);

    if (success) {
        setShowRemarksModal(false); // Close modal on success if it was open
    }
  };


  const handlePasswordChange = (e) => {
    e.preventDefault();
    // In a real app, use a modal for custom messages
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    handleShowSuccessPopup('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    handleShowSuccessPopup('Profile updated successfully!');
  };

  // UPDATED: To reflect new status names
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Donor Accepted': return 'bg-blue-100 text-blue-800';
      case 'Visit Scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'Donation Completed': return 'bg-green-100 text-green-800';
      case 'Donor Rejected':
      case 'Donation Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const menuItems = [
    { id: 'send-requests', label: 'Send Requests', icon: Send },
    { id: 'view-requests', label: 'View Requests', icon: List },
    { id: 'donor-list', label: 'Donor List', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Update Profile', icon: User },
    { id: 'change-password', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {showSuccessPopup.show && (
        <div className="fixed top-6 right-6 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="font-semibold">{showSuccessPopup.message}</p>
        </div>
      )}
      
      {/* Remarks Modal */}
      {showRemarksModal && currentRequestToUpdate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {currentUpdateStatus} for {currentRequestToUpdate.donor?.fullName || 'Donor'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {currentUpdateStatus === 'Donation Completed' 
                ? 'Add remarks about the successful donation:' 
                : 'Provide the reason for rejection (e.g., unfit, rescheduled):'
              }
            </p>
            
            {updateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{updateError}</span>
                </div>
            )}

            <textarea
              value={currentRemarks}
              onChange={(e) => {
                  setCurrentRemarks(e.target.value);
                  setUpdateError(''); // Clear error on edit
              }}
              rows="4"
              placeholder="Enter remarks here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRemarksModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdateByHospital(null, currentUpdateStatus)}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors 
                  ${currentUpdateStatus === 'Donation Completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`
                }
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-22'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-around">
          {sidebarOpen && <h2 className="text-xl font-bold text-red-600">Dashboard</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-3 hover:bg-gray-100 rounded-lg ${!sidebarOpen && 'mx-auto'}`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const unreadCount = item.id === 'messages' ? messages.filter(m => !m.read).length : 0;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  } relative`}
              >
                {/* Icon container with fixed width */}
                <div className="w-5 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>

                {/* Label with fixed left margin */}
                {sidebarOpen && (
                  <span className="flex-1 text-left ml-3">{item.label}</span>
                )}

                {/* Badge */}
                {unreadCount > 0 && (
                  <span
                    className={`bg-red-600 text-white text-xs px-2 py-0.5 rounded-full ${sidebarOpen
                      ? 'static'
                      : 'absolute top-1 right-2'
                      }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className={`w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative`}>
            {/* Icon container with fixed width */}
            <div className="w-5 flex items-center justify-center flex-shrink-0">
              <LogOut size={20} />
            </div>
            {/* Label with fixed left margin */}
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Send Requests Page */}
          {activePage === 'send-requests' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Send Donation Requests</h1>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label htmlFor="bloodGroupFilter" className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      id="bloodGroupFilter"
                      value={selectedBloodGroup}
                      onChange={(e) => setSelectedBloodGroup(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">All Available</option>
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
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      id="urgency"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  
                  {/* NEW FIELD: Deadline */}
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline (Date)
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={getMinDate()} // Ensure minimum date is tomorrow
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional details for the donor"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>

                </div>
                
                <div className='flex justify-end mb-6'>
                    <button
                        onClick={() => sendRequests(selectedDonors)}
                        // Require selected blood group, deadline, and at least one donor
                        disabled={selectedDonors.size === 0 || !selectedBloodGroup || !deadline} 
                        className="bg-red-600 text-white font-medium py-3 px-6 rounded-md shadow-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Send Request to Selected ({selectedDonors.size})
                    </button>
                </div>


                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {donorsLoading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Loading available donors...</p>
                    </div>
                  ) : donorsError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600">Error: {donorsError}</p>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 w-12">
                              <input
                                type="checkbox"
                                ref={selectAllCheckboxRef}
                                checked={filteredDonors.length > 0 && selectedDonors.size === filteredDonors.length}
                                onChange={handleSelectAll}
                                disabled={!selectedBloodGroup || filteredDonors.length === 0}
                                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Blood Group
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredDonors.map(donor => (
                            <tr key={donor._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedDonors.has(donor._id)}
                                  onChange={() => handleSelectDonor(donor._id)}
                                  disabled={!selectedBloodGroup}
                                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {donor.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                                    {donor.bloodGroup}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {donor.contactNumber}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => sendRequests(new Set([donor._id]))}
                                  disabled={!selectedBloodGroup || !deadline}
                                  className="text-sm text-red-600 hover:text-red-700 hover:opacity-80 disabled:text-gray-400 font-medium"
                                >
                                  Send Request
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredDonors.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No available donors match the selected criteria.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View Requests Page */}
          {activePage === 'view-requests' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Track All Requests</h1>

              <div className="bg-white rounded-lg shadow-sm p-6">
                {requestsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading requests...</p>
                  </div>
                ) : requestsError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Error: {requestsError}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.length > 0 ? requests.map(req => (
                      <div key={req._id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                              <span className="text-2xl font-bold text-red-600">{req.bloodGroup}</span>
                              <div className='flex items-center gap-2'>
                                <p className="font-semibold text-gray-800">Urgency: {req.urgency}</p>
                                <p className="text-sm text-gray-500">| Sent: {new Date(req.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {req.donor && (
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Sent to: <span className="font-medium text-gray-800">{req.donor.fullName}</span></p>
                                <p>Contact: <span className="font-medium text-gray-800">{req.donor.contactNumber}</span></p>
                                <p className='text-sm font-semibold text-red-600'>Deadline: {new Date(req.deadline).toLocaleDateString()}</p>
                              </div>
                            )}
                            {(req.note || req.remarks) && (
                                <div className='mt-3 text-sm'>
                                    {req.note && <p className='text-gray-700'>Note: <span className='font-medium'>{req.note}</span></p>}
                                    {req.remarks && <p className='text-gray-700'>Remarks: <span className='font-medium'>{req.remarks}</span></p>}
                                </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                            
                            {/* Actions based on new status workflow */}
                            <div className='flex gap-2 mt-2'>
                                {/* Action: After Donor Accepted -> Hospital needs to schedule visit or reject */}
                                {req.status === 'Donor Accepted' && (
                                  <button
                                    onClick={() => handleStatusUpdateByHospital(req, 'Visit Scheduled')}
                                    className="bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                                  >
                                    Schedule Visit
                                  </button>
                                )}
                                
                                {/* Action: After Visit Scheduled -> Hospital can complete or reject */}
                                {req.status === 'Visit Scheduled' && (
                                  <>
                                    <button
                                      onClick={() => initiateStatusUpdate(req, 'Donation Completed')}
                                      className="bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                      Mark Completed
                                    </button>
                                    <button
                                      onClick={() => initiateStatusUpdate(req, 'Donation Rejected')}
                                      className="bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                      Mark Rejected
                                    </button>
                                  </>
                                )}
                                
                                {/* Action: Pending -> Hospital can only cancel */}
                                {req.status === 'Pending' && (
                                  <button
                                    onClick={() => handleCancelRequest(req._id)}
                                    className="bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                                  >
                                    Cancel Request
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No requests have been sent yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Donor List Page */}
          {activePage === 'donor-list' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">All Donors</h1>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search donors by name, blood group..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {donorsListLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading donors...</p>
                  </div>
                ) : donorsListError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Error: {donorsListError}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donorsList.map(donor => (
                          <tr key={donor._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{donor.fullName}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">{donor.bloodGroup}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{donor.contactNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{donor.location || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full font-medium ${donor.isAvailable
                                    ? 'bg-green-100 text-green-800' // Available: Green background and text
                                    : 'bg-red-100 text-red-800'    // Not Available: Red background and text
                                  }`}>
                                {donor.isAvailable ? 'Available' : 'Not Available'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Page */}
          {activePage === 'messages' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>

              <div className="bg-white rounded-lg shadow-sm">
                {messages.map(msg => (
                  <div key={msg.id} className={`p-6 border-b border-gray-200 ${!msg.read ? 'bg-red-50' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{msg.name}</h3>
                        <p className="text-sm text-gray-500">{msg.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{msg.date}</p>
                        {!msg.read && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">New</span>}
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{msg.message}</p>
                    <div className="mt-4 flex gap-2">
                      <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-600 hover:opacity-90">Reply</button>
                      <button className="text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">Mark as Read</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Profile Page */}
          {activePage === 'profile' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Hospital Profile</h1>

              <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                      <input
                        type="text"
                        value={hospitalProfile.name}
                        onChange={(e) => setHospitalProfile({ ...hospitalProfile, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={hospitalProfile.email}
                        onChange={(e) => setHospitalProfile({ ...hospitalProfile, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={hospitalProfile.phone}
                        onChange={(e) => setHospitalProfile({ ...hospitalProfile, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={hospitalProfile.address}
                        onChange={(e) => setHospitalProfile({ ...hospitalProfile, address: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        value={hospitalProfile.license}
                        onChange={(e) => setHospitalProfile({ ...hospitalProfile, license: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-md hover:bg-red-600 hover:opacity-90 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Page */}
          {activePage === 'change-password' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Change Password</h1>

              <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-md hover:bg-red-600 hover:opacity-90 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HospitalDashboardPage;
