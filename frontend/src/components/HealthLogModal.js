import React, { useState, useEffect } from 'react';

export default function HealthLogModal({ open, onClose, onSubmit }) {
  const [date, setDate] = useState('');
  const [hb, setHb] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setDate('');
      setHb('');
      setWeight('');
      setNotes('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const d = date || new Date().toISOString().slice(0,10);
    const hemoglobin = parseFloat(hb);
    const wt = parseFloat(weight);
    if (isNaN(hemoglobin) || hemoglobin < 0 || hemoglobin > 25) {
      setError('Please enter hemoglobin between 0 and 25 g/dL.');
      return;
    }
    if (isNaN(wt) || wt < 0 || wt > 300) {
      setError('Please enter weight between 0 and 300 kg.');
      return;
    }
    setError('');
    onSubmit({ date: d, hemoglobin, weight: wt, notes: notes.trim() });
  };

  const warn = hb !== '' && parseFloat(hb) < 12.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Add Health Log</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
            <input type="number" step="0.1" min="0" max="25" className="w-full border rounded-lg px-3 py-2" value={hb} onChange={(e)=>setHb(e.target.value)} />
            {warn && <p className="text-xs text-amber-700 mt-1">Hemoglobin below 12.5 g/dL — donation may not be advised.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" step="0.1" min="0" max="300" className="w-full border rounded-lg px-3 py-2" value={weight} onChange={(e)=>setWeight(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2" value={notes} onChange={(e)=>setNotes(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-red-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}


