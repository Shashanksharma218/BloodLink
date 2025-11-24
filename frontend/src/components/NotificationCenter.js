import React from 'react';

export default function NotificationCenter({ open, notifications = [], onClose, onMarkRead }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-[110] w-full max-w-md h-full bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Notifications</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-md border">Close</button>
        </div>
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id} className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{n.title || n.type}</p>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
                {!n.read && (
                  <button onClick={() => onMarkRead([n.id])} className="text-xs text-blue-600 underline">Mark read</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


