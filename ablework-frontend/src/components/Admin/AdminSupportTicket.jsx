import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Open'); // 'Open' or 'Resolved'

  // 1. Fetch the tickets when the page loads
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/support/tickets`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Mark ticket as resolved
  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (res.ok) {
        // Update local state to show it's resolved
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Disable the user's account (BAN)
  const handleDisableUser = async (userId) => {
    if (!userId) return alert("This ticket was submitted by a Guest. No account to disable.");
    if (!window.confirm("Are you sure you want to disable this user's account? They will be immediately logged out.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/account-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_status: 'Disabled' })
      });
      if (res.ok) {
        alert("User account has been disabled.");
        // Auto-resolve the ticket that triggered the ban
        const ticketToResolve = tickets.find(t => t.user_id === userId);
        if (ticketToResolve) handleResolve(ticketToResolve.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to disable user.");
    }
  };

  // Filter tickets based on the selected tab
  const filteredTickets = tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'Open').length;

  if (isLoading) return <div className="p-8 font-bold text-[#03045E]">Loading tickets...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-[#03045E]/15 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-[#03045E]/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#03045E]">Support & Reports</h2>
          <p className="text-sm font-bold text-[#03045E]/70 mt-1">Review user reports and manage account bans.</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-[#f4f4f4] p-1 rounded-lg border border-[#03045E]/10">
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${filter === 'Open' ? 'bg-white text-[#DC2626] shadow-sm' : 'text-gray-500 hover:text-[#03045E]'}`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${filter === 'Resolved' ? 'bg-white text-[#10B981] shadow-sm' : 'text-gray-500 hover:text-[#03045E]'}`}
          >
            Resolved
          </button>
        </div>
      </div>
      
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#03045E]/20 rounded-xl bg-[#f4f4f4]">
          <p className="text-[#03045E] font-bold">No {filter.toLowerCase()} tickets found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id} 
              className={`p-5 rounded-xl border-2 transition-all ${ticket.status === 'Open' ? 'border-[#DC2626]/50 bg-red-50/30' : 'border-[#10B981]/50 bg-green-50/30 opacity-75'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-extrabold text-[#03045E] text-lg">{ticket.subject}</h3>
                  <p className="text-xs font-bold text-[#03045E]/70 mt-1">
                    From: <span className="text-[#2C7FFF]">{ticket.user_name}</span> ({ticket.user_email}) 
                    <span className="mx-2">•</span> 
                    Role: {ticket.user_role}
                    <span className="mx-2">•</span> 
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-[#DC2626] text-white' : 'bg-[#10B981] text-white'}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="text-sm text-[#03045E] bg-white p-4 rounded-lg border border-[#03045E]/10 mt-3 mb-4 whitespace-pre-wrap font-medium">
                {ticket.message}
              </div>

              <div className="flex flex-wrap gap-3">
                {ticket.status === 'Open' && (
                  <button 
                    onClick={() => handleResolve(ticket.id)}
                    className="px-4 py-2 bg-[#03045E] text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-[#2C7FFF] transition-colors cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                )}
                
                {/* Only show Ban button if the ticket has a user ID and is still Open */}
                {ticket.user_id && ticket.status === 'Open' && (
                  <button 
                    onClick={() => handleDisableUser(ticket.user_id)}
                    className="px-4 py-2 bg-[#DC2626] text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Disable User Account
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}