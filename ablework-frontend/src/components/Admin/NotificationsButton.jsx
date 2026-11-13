import React, { useState, useEffect } from 'react';

export default function NotificationsButton({ userId }) {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real notifications from the database
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch when component mounts or user ID changes
  useEffect(() => {
    fetchNotifications();
    // Optional: Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  // Handle Mark All as Read
  const handleMarkAllRead = async () => {
    setIsLoading(true);
    const unread = notifications.filter(n => !n.is_read);
    
    try {
      // Loop through and update each unread notification via API
      for (let n of unread) {
        await fetch(`http://localhost:5001/api/notifications/${n.id}/read`, {
          method: 'PUT'
        });
      }
      // Update local state instantly
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Format the timestamp nicely
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Dynamic styling based on notification type
  const getStyleForType = (type) => {
    switch (type) {
      case 'application':
        return {
          bg: 'bg-[#10b981]/15', color: 'text-[#047857]', border: 'border-[#10b981]/40',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        };
      case 'match':
        return {
          bg: 'bg-[#f59e0b]/15', color: 'text-[#b45309]', border: 'border-[#f59e0b]/40',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        };
      case 'update':
      default:
        return {
          bg: 'bg-[#2C7FFF]/15', color: 'text-[#2C7FFF]', border: 'border-[#2C7FFF]/40',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        };
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-card,#ffffff)] text-[var(--color-text,#03045E)] border-2 border-[var(--color-border,rgba(3,4,94,0.2))] shadow-sm transition-all duration-200 shrink-0 cursor-pointer hover:bg-[#F4F4F4]"
        title="Notifications"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#dc2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[1px] animate-in fade-in transition-all duration-300"
          style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)', filter: 'none' }}
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white border-2 border-[#2C7FFF] max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-[#2C7FFF] shrink-0" />

            <div className="relative px-6 sm:px-8 pt-6 pb-4 flex flex-col items-center text-center shrink-0">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-transparent border-4 border-[#2C7FFF]">
                  <svg className="w-8 h-8 text-[#2C7FFF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#dc2626] text-white border-2 border-white">
                    {unreadCount}
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border-2 text-[#2C7FFF] bg-transparent border-[#2C7FFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Inbox
              </span>

              <h2 className="text-2xl font-black tracking-tight mb-1 text-[#03045E]">
                Notifications
              </h2>
              <p className="text-xs font-bold leading-relaxed max-w-xs text-[#03045E]/80">
                Stay updated with activity across your admin workspace.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-5 flex flex-col gap-3">
              <div className="rounded-2xl border-2 border-[var(--color-border,rgba(3,4,94,0.15))] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#f4f4f4] border-b-2 border-[var(--color-border,rgba(3,4,94,0.1))] flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#03045E]">Recent Activity</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black text-[#2C7FFF]">{unreadCount} unread</span>
                  )}
                </div>

                <div className="divide-y-2 divide-[var(--color-border,rgba(3,4,94,0.08))] max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#03045E]/50 text-xs font-bold">
                      You have no new notifications.
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const style = getStyleForType(item.type);
                      return (
                        <div key={item.id} className={`flex items-start gap-3 px-4 py-3 transition-colors ${item.is_read ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${style.bg} ${style.color} ${style.border}`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-black truncate ${item.is_read ? 'text-[#03045E]/80' : 'text-[#03045E]'}`}>
                                {item.title}
                              </p>
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#03045E]/50 shrink-0">
                                {formatTime(item.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-[#03045E]/70 leading-relaxed mt-0.5">
                              {item.message}
                            </p>
                          </div>
                          {!item.is_read && (
                            <div className="w-2 h-2 rounded-full bg-[#2C7FFF] mt-1.5 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-row gap-3 mt-1">
                <button
                  onClick={() => setShowPanel(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#03045E] border-[#03045E] hover:bg-[#F4F4F4]"
                >
                  Close
                </button>
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0 || isLoading}
                  className="flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border-2 text-[#2C7FFF] border-[#2C7FFF] hover:bg-[#2C7FFF]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Mark All Read'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}