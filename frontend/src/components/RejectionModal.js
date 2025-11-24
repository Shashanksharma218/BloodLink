import React, { useState, useEffect } from 'react';

export default function RejectionModal({ open, onClose, onSubmit }) {
  const PRESETS = [
    'Unwell today',
    'Not eligible (medical)',
    'Schedule conflict',
    'Personal reasons',
    'Other'
  ];
  const [reason, setReason] = useState(PRESETS[0]);
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason(PRESETS[0]);
      setOtherText('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    const text = reason === 'Other' ? otherText.trim() : reason;
    if (reason === 'Other' && text.length === 0) {
      setError('Please provide a reason (max 250 characters).');
      return;
    }
    if (text.length > 250) {
      setError('Please limit to 250 characters.');
      return;
    }
    onSubmit(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Decline Request</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Select a reason</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {PRESETS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {reason === 'Other' && (
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={4}
              placeholder="Please provide a brief reason (max 250 chars)"
              maxLength={250}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
}


