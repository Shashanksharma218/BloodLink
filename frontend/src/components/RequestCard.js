import React, { useState, useEffect } from 'react';
import { Phone, Clock, AlertCircle, CheckCircle, XCircle, Calendar, Download, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RequestCard({ request, getHospitalContact, getStatusConfig, onAccept, onReject, onDownloadCertificate }) {
  const [contactNumber, setContactNumber] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!request.hospitalId) {
      setContactLoading(false);
      return;
    }
    (async () => {
      try {
        const c = await getHospitalContact(request.hospitalId);
        setContactNumber(c);
      } catch (e) {
        console.warn('Failed to fetch hospital contact', e);
      } finally {
        setContactLoading(false);
      }
    })();
  }, [request.hospitalId, getHospitalContact]);

  const statusConfig = request.status && getStatusConfig ? getStatusConfig(request.status) : null;
  const isCompleted = request.status === 'Donation Completed';
  const isPending = request.status === 'Pending';
  const isRejected = request.status === 'Donor Rejected' || request.status === 'Donation Rejected';

  const urgencyColors = {
    'Urgent': 'bg-red-100 text-red-700 border-red-300',
    'High': 'bg-orange-100 text-orange-700 border-orange-300',
    'Medium': 'bg-amber-100 text-amber-700 border-amber-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`bg-white rounded-xl border-l-4 ${
        isCompleted ? 'border-l-green-500' : isPending ? 'border-l-red-600' : isRejected ? 'border-l-gray-400' : 'border-l-blue-500'
      } border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-white ${
                isCompleted ? 'bg-green-600' : isPending ? 'bg-red-600' : isRejected ? 'bg-gray-400' : 'bg-blue-600'
              }`}>
                {request.bloodGroup}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${urgencyColors[request.urgency] || urgencyColors['Medium']}`}>
                    {isPending && <AlertCircle className="w-3 h-3" />}
                    {request.urgency}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                    <Clock className="w-3 h-3" />
                    {new Date(request.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isPending ? 'Requested' : isCompleted ? 'Completed' : 'Updated'} {new Date(isPending ? request.createdAt : request.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            {statusConfig && (
              <span className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusConfig.color}`}>
                <statusConfig.icon className="w-3.5 h-3.5" />
                {request.status}
              </span>
            )}
          </div>

          {request.note && (
            <div className={`text-sm p-3 rounded-lg ${isPending ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 text-gray-700'}`}>
              <span className="font-semibold">Note:</span> {request.note}
            </div>
          )}

          <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide' : 'Show'} details
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden mt-2"
              >
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 block">Hospital Contact</span>
                    {contactLoading ? (
                      <span className="text-sm text-gray-400">Loading...</span>
                    ) : contactNumber ? (
                      <a href={`tel:${contactNumber}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">{contactNumber}</a>
                    ) : (
                      <span className="text-sm text-gray-500">Not available</span>
                    )}
                  </div>
                </div>

                {request.remarks && (
                  <div className="text-sm p-3 bg-gray-50 rounded-lg text-gray-700">
                    <span className="font-semibold">Remarks:</span> {request.remarks}
                  </div>
                )}

                {request.status === 'Visit Scheduled' && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-700">Hospital is expecting your visit!</p>
                  </div>
                )}

                {(isCompleted || request.certificateId) && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-green-700">Certificate</p>
                      {request.certificateId ? (
                        <p className="text-sm font-semibold text-green-800">ID: {request.certificateId}</p>
                      ) : (
                        <p className="text-sm font-semibold text-green-800">Ready to download</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex lg:flex-col items-center lg:items-end gap-2 lg:min-w-[140px] border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-4">
          {isPending && (
            <>
              <button 
                onClick={() => onAccept(request._id)} 
                className="flex-1 lg:flex-none w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button 
                onClick={() => onReject(request._id)} 
                className="flex-1 lg:flex-none w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold py-2.5 px-5 rounded-lg transition-all"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </>
          )}
          {statusConfig && (
            <span className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusConfig.color}`}>
              <statusConfig.icon className="w-3.5 h-3.5" />
              {request.status}
            </span>
          )}
          {isCompleted && onDownloadCertificate && (
            <button
              onClick={() => onDownloadCertificate(request._id)}
              className="w-full flex itemsCenter justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <Download className="w-6 h-6" />
              Download
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

