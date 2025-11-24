import React from 'react';
import { List, Calendar, User, Phone, Clock, MessageSquare } from 'lucide-react';
import API_BASE_URL from '../../config/api';

function ViewRequestsPage({
  requests,
  requestsLoading,
  requestsError,
  setRequests,
  handleShowSuccessPopup,
  setShowRemarksModal,
  setCurrentRequestToUpdate,
  setCurrentUpdateStatus,
  setCurrentRemarks,
  setUpdateError
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Donor Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Visit Scheduled': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Donation Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Donor Rejected':
      case 'Donation Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}`, { method: 'DELETE' });
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

  const updateRequestStatusAPI = async (requestId, status, remarks = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/status/hospital`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update status to ${status}.`);
      }

      const updatedRequest = await response.json();

      setRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: updatedRequest.status, remarks: updatedRequest.remarks } : req
      ));

      handleShowSuccessPopup(`Request status updated to ${updatedRequest.status}!`);
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const initiateStatusUpdate = (request, status) => {
    setCurrentRequestToUpdate(request);
    setCurrentUpdateStatus(status);
    setCurrentRemarks(request.remarks || '');
    setUpdateError('');
    setShowRemarksModal(true);
  };

  const handleStatusUpdateByHospital = async (request, status, remarks = '') => {
    if (status === 'Visit Scheduled') {
      await updateRequestStatusAPI(request._id, status, remarks);
      return;
    }
  };

  const handleDownloadCertificate = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/${requestId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download certificate.');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `BloodDonationCertificate_${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
          <List size={24} className="sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Track All Requests</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        {requestsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600"></div>
            <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading requests...</p>
          </div>
        ) : requestsError ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm sm:text-base">Error: {requestsError}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {requests.length > 0 ? requests.map(req => (
              <div key={req._id} className="border border-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-300 transition-all bg-gradient-to-br from-white to-red-50/30 shadow-sm hover:shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl font-bold text-red-600 bg-red-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                          {req.bloodGroup}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                            <Clock size={14} className="sm:w-4 sm:h-4 text-red-600" />
                            Urgency: {req.urgency}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                            Sent: {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {req.donor && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-red-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <User size={14} className="sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                            <span className="text-gray-600">Donor:</span>
                            <span className="font-medium text-gray-800 truncate">{req.donor.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                            <span className="text-gray-600">Contact:</span>
                            <span className="font-medium text-gray-800">{req.donor.contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Calendar size={14} className="sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-semibold text-red-600">{new Date(req.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {(req.note || req.remarks || req.certificateId) && (
                      <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm space-y-2 border border-blue-200">
                        {req.note && (
                          <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-600">Note:</span>
                              <span className="font-medium text-gray-800 ml-2">{req.note}</span>
                            </div>
                          </div>
                        )}
                        {req.remarks && (
                          <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-600">Remarks:</span>
                              <span className="font-medium text-gray-800 ml-2">{req.remarks}</span>
                            </div>
                          </div>
                        )}
                        {req.certificateId && (
                          <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-600">Certificate ID:</span>
                              <span className="font-medium text-green-800 ml-2">{req.certificateId}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-3 border-t border-red-100">
                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl border ${getStatusColor(req.status)} w-fit`}>
                      {req.status}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {req.status === 'Donor Accepted' && (
                        <button
                          onClick={() => handleStatusUpdateByHospital(req, 'Visit Scheduled')}
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg flex-1 sm:flex-initial"
                        >
                          Schedule Visit
                        </button>
                      )}

                      {req.status === 'Visit Scheduled' && (
                        <>
                          <button
                            onClick={() => initiateStatusUpdate(req, 'Donation Completed')}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex-1 sm:flex-initial"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => initiateStatusUpdate(req, 'Donation Rejected')}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex-1 sm:flex-initial"
                          >
                            Mark Rejected
                          </button>
                        </>
                      )}

                      {req.status === 'Donation Completed' && (
                        <button
                          onClick={() => handleDownloadCertificate(req._id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex-1 sm:flex-initial"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Certificate
                        </button>
                      )}

                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelRequest(req._id)}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex-1 sm:flex-initial"
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
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <List size={24} className="sm:w-8 sm:h-8 text-red-600" />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">No requests have been sent yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewRequestsPage;