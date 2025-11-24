import React from 'react';
import { MessageSquare, Mail, Calendar, Reply } from 'lucide-react';

function MessagesPage({ messages }) {
  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
          <MessageSquare size={24} className="sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Messages</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`p-4 sm:p-6 ${index !== messages.length - 1 ? 'border-b border-red-100' : ''} ${
              !msg.read ? 'bg-gradient-to-r from-red-50 to-red-100/30' : 'bg-white'
            } hover:bg-red-50/50 transition-colors`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{msg.name}</h3>
                  {!msg.read && (
                    <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium shadow-sm">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Mail size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <p className="truncate">{msg.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                <p>{msg.date}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-red-100">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{msg.message}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex items-center justify-center gap-2 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-medium w-full sm:w-auto">
                <Reply size={14} className="sm:w-4 sm:h-4" />
                Reply
              </button>
              <button className="text-xs sm:text-sm border border-gray-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-medium w-full sm:w-auto">
                Mark as Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessagesPage;