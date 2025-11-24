import React from 'react';
import { X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

function RemarksModal({
  show,
  currentRequestToUpdate,
  currentUpdateStatus,
  currentRemarks,
  setCurrentRemarks,
  updateError,
  setUpdateError,
  setShowRemarksModal,
  setRequests,
  handleShowSuccessPopup
}) {
  if (!show || !currentRequestToUpdate) return null;

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
      setUpdateError('');
      return true;
    } catch (err) {
      setUpdateError(err.message);
      return false;
    }
  };

  const handleStatusUpdateByHospital = async () => {
    const request = currentRequestToUpdate;
    const status = currentUpdateStatus;
    const remarks = currentRemarks;

    if (!request || !status) return;

    if ((status === 'Donation Rejected' || status === 'Donation Completed') && (!remarks || remarks.trim() === '')) {
      setUpdateError('Remarks are required for this status change.');
      return;
    }

    const success = await updateRequestStatusAPI(request._id, status, remarks);

    if (success) {
      setShowRemarksModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md transform transition-all animate-fade-in">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {currentUpdateStatus}
          </h2>
          <button
            onClick={() => setShowRemarksModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Donor: <span className="font-semibold text-gray-800">{currentRequestToUpdate.donor?.fullName || 'N/A'}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            {currentUpdateStatus === 'Donation Completed'
              ? 'Add remarks about the successful donation:'
              : 'Provide the reason for rejection (e.g., unfit, rescheduled):'
            }
          </p>
        </div>

        {updateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl relative mb-3 sm:mb-4 text-xs sm:text-sm" role="alert">
            <span className="block sm:inline">{updateError}</span>
          </div>
        )}

        <textarea
          value={currentRemarks}
          onChange={(e) => {
            setCurrentRemarks(e.target.value);
            setUpdateError('');
          }}
          rows="4"
          placeholder="Enter remarks here..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={() => setShowRemarksModal(false)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleStatusUpdateByHospital}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg order-1 sm:order-2 ${
              currentUpdateStatus === 'Donation Completed'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
            }`}
          >
            Confirm Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemarksModal;