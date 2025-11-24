import React, { useEffect } from 'react';
import { Send, List, Users, Lock, MessageSquare, User, LogOut, LayoutDashboard, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

function Sidebar({ sidebarOpen, setSidebarOpen, activePage, setActivePage, menuItems, messages, handleLogout }) {
  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);
  const iconComponents = {
    Send,
    List,
    Users,
    MessageSquare,
    User,
    Lock,
  };

  // Close sidebar when clicking overlay (mobile only)
  const handleOverlayClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed at top-left, visible only on mobile when sidebar is closed */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-[60] p-3 bg-white rounded-xl shadow-lg hover:bg-red-50 transition-all ${
          sidebarOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open menu"
      >
        <PanelLeftOpen size={24} className="text-red-600" />
      </button>

      {/* Overlay - Only visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0  z-[45] bg-black/80 transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'md:w-22 w-64'}
          fixed md:sticky top-0 left-0 h-screen md:h-auto md:min-h-screen
          bg-white/80 backdrop-blur-xl border-r border-red-100 
          flex flex-col transition-all duration-300 shadow-lg 
          overflow-hidden z-50 md:z-auto
        `}
      >
        <div className="p-4 border-b border-red-100 flex items-center justify-between md:justify-around">
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 delay-150' : 'opacity-0 md:opacity-100'}`}>
            {sidebarOpen && (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <LayoutDashboard size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent whitespace-nowrap">
                  Dashboard
                </h2>
              </>
            )}
          </div>
          
          {/* Toggle button - visible on all screens when sidebar is open, or on desktop when collapsed */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-3 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] ${
              !sidebarOpen && 'mx-auto hidden md:block'
            }`}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={20} className="text-red-600" />
            ) : (
              <PanelLeftOpen size={20} className="text-red-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = iconComponents[item.icon];
            const isActive = activePage === item.id;
            const unreadCount = item.id === 'messages' ? messages.filter(m => !m.read).length : 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  // Close sidebar on mobile after selecting
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 min-h-[44px] ${
                  isActive
                    ? 'bg-red-50 text-red-600 font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-red-50/50'
                } relative`}
              >
                <div className="w-5 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} />
                </div>

                {sidebarOpen && (
                  <span className={`flex-1 text-left ml-3 whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                )}

                {unreadCount > 0 && (
                  <span
                    className={`bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-sm ${
                      sidebarOpen ? 'static' : 'absolute top-1 right-2'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-red-200 to-transparent my-2"></div>
          <div className="p-4">
            <button
              className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-300 min-h-[44px]"
              onClick={handleLogout}
            >
              <div className="w-5 flex items-center justify-center flex-shrink-0">
                <LogOut size={20} />
              </div>
              {sidebarOpen && (
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 delay-150' : 'opacity-0'}`}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;