import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config';

export function AdminSupportTickets({ onTicketResolved }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [resolveModal, setResolveModal] = useState({ isOpen: false, ticket: null, days: 7 });

  // Check for dark mode on mount
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark-mode') || 
                         document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/support/tickets`);
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map(t => {
          let parsedReasons = t.reasons;
          if (typeof parsedReasons === 'string') {
            try { parsedReasons = JSON.parse(parsedReasons); } catch (e) { parsedReasons = []; }
          }
          if (!Array.isArray(parsedReasons)) parsedReasons = [];
          return { ...t, reasons: parsedReasons };
        });
        setTickets(normalized);
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

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
        setSelectedTicket(null);
        
        // Trigger parent refresh
        if (onTicketResolved) onTicketResolved(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve WITH penalty (disable reported user for N days)
  const handleResolveWithPenalty = async () => {
    const { ticket, days } = resolveModal;
    if (!ticket) return;
    try {
      const disableRes = await fetch(`${API_BASE_URL}/api/admin/users/${ticket.reported_user_id}/disable-with-penalty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          penalty_days: Number(days),
          reasons: ticket.reasons,
          ticket_id: ticket.id
        })
      });

      const resolveRes = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${ticket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });

      if (disableRes.ok && resolveRes.ok) {
        setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: 'Resolved' } : t));
        setSelectedTicket(null);
        setResolveModal({ isOpen: false, ticket: null, days: 7 });
        if (onTicketResolved) onTicketResolved();
      }
    } catch (err) { console.error(err); }
  };

  const filteredTickets = tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'Open').length;

  if (isLoading) return <div className={`p-8 font-bold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Loading tickets...</div>;

  return (
    <div className={`${isDark ? 'bg-black border-white/20' : 'bg-white border-[#03045E]/15'} rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col transition-colors duration-300`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b-2 ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Support & Reports</h2>
          <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Review user reports and manage account bans.</p>
        </div>
        
        <div className={`flex p-1 rounded-lg border shrink-0 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-[#f4f4f4] border-[#03045E]/10'}`}>
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'Open' 
                ? (isDark ? 'bg-white !text-black shadow-sm' : 'bg-[#03045E] !text-white shadow-sm') 
                : (isDark ? 'text-white/70 hover:text-white' : 'text-[#03045E]/70 hover:text-[#03045E]')
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'Resolved' 
                ? (isDark ? 'bg-white !text-black shadow-sm' : 'bg-[#03045E] !text-white shadow-sm') 
                : (isDark ? 'text-white/70 hover:text-white' : 'text-[#03045E]/70 hover:text-[#03045E]')
            }`}
          >
            Resolved
          </button>
        </div>
      </div>
      
      {/* Table View */}
      {filteredTickets.length === 0 ? (
        <div className={`text-center py-16 m-6 border-2 border-dashed rounded-xl ${isDark ? 'border-white/20 bg-zinc-900' : 'border-[#03045E]/20 bg-[#f4f4f4]'}`}>
          <p className={`font-bold ${isDark ? 'text-white/70' : 'text-[#03045E]'}`}>No {filter.toLowerCase()} tickets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${isDark ? 'bg-zinc-900 border-white/10' : 'bg-[#f4f4f4] border-[#03045E]/10'} border-b-2`}>
                <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Subject</th>
                <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Reported By</th>
                <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Date Reported</th>
                <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-[#03045E]/10'}`}>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-[#f4f4f4]/50'} transition-colors`}>
                  <td className="py-4 px-6">
                    <p className={`text-sm font-black truncate max-w-[200px] sm:max-w-xs ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{ticket.subject}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        ticket.status === 'Open' ? 'bg-[#2C7FFF] !text-white' : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600')
                      }`}>
                        {ticket.status}
                      </span>
                      {Array.isArray(ticket.reasons) && ticket.reasons.length > 0 && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ticket.reasons.length} {ticket.reasons.length === 1 ? 'reason' : 'reasons'}
                        </span>
                      )}
                    </div>
                    {Array.isArray(ticket.reasons) && ticket.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                        {ticket.reasons.slice(0, 3).map((r, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${isDark ? 'bg-zinc-800 text-white border-white/20' : 'bg-[#2C7FFF]/10 text-[#03045E] border-[#2C7FFF]/30'}`}>
                            {r}
                          </span>
                        ))}
                        {ticket.reasons.length > 3 && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                            +{ticket.reasons.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>{ticket.user_name}</p>
                    <p className={`text-[10px] font-semibold ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>{ticket.user_role}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-[#03045E]/80'}`}>
                      {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className={`text-[10px] font-semibold ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                      {new Date(ticket.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {/* FORCED COLOR FIX */}
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        isDark 
                          ? 'bg-white !text-black border-white hover:bg-gray-200' 
                          : 'bg-[#2C7FFF] !text-white border-[#2C7FFF] hover:bg-[#03045E] hover:border-[#03045E]'
                      }`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(3, 4, 94, 0.6)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-modal-title"
        >
          <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border-2 overflow-hidden ${isDark ? 'bg-black border-white/20' : 'bg-white border-[#03045E]/20'}`}>
            
            {/* Modal Header */}
            <div className={`flex justify-between items-start p-6 border-b-2 ${isDark ? 'border-white/10 bg-zinc-900' : 'border-[#03045E]/10 bg-[#f4f4f4]'}`}>
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <h2 id="ticket-modal-title" className={`text-xl font-black break-words ${isDark ? 'text-white' : 'text-[#03045E]'}`}>
                    {selectedTicket.subject}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    selectedTicket.status === 'Open' ? 'bg-[#2C7FFF] !text-white' : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600')
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>
                  From: <span className="text-[#2C7FFF]">{selectedTicket.user_name}</span> ({selectedTicket.user_email}) 
                  <span className="mx-2">•</span> 
                  Role: {selectedTicket.user_role}
                  <span className="mx-2">•</span> 
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className={`p-2 rounded-lg border-2 transition-colors cursor-pointer shrink-0 ${
                  isDark 
                    ? 'bg-zinc-800 !text-white border-white/20 hover:bg-white hover:!text-black' 
                    : 'bg-white !text-[#03045E] border-[#03045E]/20 hover:bg-[#03045E] hover:!text-white'
                }`}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {Array.isArray(selectedTicket.reasons) && selectedTicket.reasons.length > 0 && (
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Report Reasons</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${
                          isDark
                            ? 'bg-zinc-900 border-white/20 text-white'
                            : 'bg-[#2C7FFF]/10 border-[#2C7FFF]/40 text-[#03045E]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2C7FFF]" />
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Message</span>
                <div className={`p-4 rounded-xl border-2 text-sm font-medium whitespace-pre-wrap leading-relaxed shadow-sm ${
                  isDark ? 'border-white/10 bg-zinc-900 text-white' : 'border-[#03045E]/10 bg-white text-[#03045E]'
                }`}>
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.image_path && (
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Attached Proof</span>
                  <a 
                    href={selectedTicket.image_path.startsWith('http') ? selectedTicket.image_path : `${API_BASE_URL}/uploads/${selectedTicket.image_path.replace(/^uploads[\\/]/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block relative group rounded-xl overflow-hidden border-2 shadow-sm ${isDark ? 'border-white/20' : 'border-[#03045E]/20'}`}
                  >
                    <img 
                      src={selectedTicket.image_path.startsWith('http') ? selectedTicket.image_path : `${API_BASE_URL}/uploads/${selectedTicket.image_path.replace(/^uploads[\\/]/, '')}`}
                      alt="Proof attachment" 
                      className={`max-w-full max-h-[300px] object-contain group-hover:opacity-90 transition-opacity ${isDark ? 'bg-black' : 'bg-[#f4f4f4]'}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <span className="text-white font-bold text-xs bg-black/70 px-3 py-1.5 rounded-lg">Click to enlarge</span>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedTicket.status === 'Open' && (
              <div className={`p-6 border-t-2 flex flex-col sm:flex-row justify-end gap-3 mt-auto ${isDark ? 'border-white/10 bg-zinc-900' : 'border-[#03045E]/10 bg-[#f4f4f4]'}`}>
                <button
                  onClick={() => handleResolve(selectedTicket.id)}
                  className={`px-6 py-2.5 border-2 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 ${isDark ? 'bg-zinc-800 !text-white border-white/20 hover:bg-white hover:!text-black' : 'bg-white !text-[#03045E] border-[#03045E]/30 hover:bg-[#03045E] hover:!text-white'}`}
                >
                  Resolve Only
                </button>
                <button
                  onClick={() => setResolveModal({ isOpen: true, ticket: selectedTicket, days: 7 })}
                  className={`px-6 py-2.5 border-2 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 bg-[#DC2626] !text-white border-[#DC2626] hover:bg-[#b91c1c]`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  Resolve + Disable Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PENALTY MODAL — choose how many days to disable */}
      {resolveModal.isOpen && resolveModal.ticket && (
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(72, 71, 71, 0.6)' }}>
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-black border-white' : 'bg-white border-[#DC2626]'}`}>
            <div className="h-2 w-full bg-[#DC2626]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${isDark ? 'border-white' : 'border-[#DC2626]'}`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#DC2626]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Disable Account</h2>
                  <p className={`text-xs font-bold ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Penalty for {resolveModal.ticket.user_name}</p>
                </div>
              </div>

              {resolveModal.ticket.reasons?.length > 0 && (
                <div className={`p-3 rounded-lg border-2 mb-4 ${isDark ? 'bg-zinc-900 border-white/20' : 'bg-amber-50 border-amber-300'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/60' : 'text-amber-800'}`}>Report Reasons</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resolveModal.ticket.reasons.map((r, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isDark ? 'bg-black text-white border-white/20' : 'bg-white text-amber-900 border-amber-300'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                Penalty Duration (Days)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setResolveModal({ ...resolveModal, days: d })}
                    className={`py-2 rounded-lg font-black text-sm border-2 transition cursor-pointer ${Number(resolveModal.days) === d ? (isDark ? 'bg-white text-black border-white' : 'bg-[#DC2626] text-white border-[#DC2626]') : (isDark ? 'bg-black text-white border-white/30' : 'bg-white text-[#03045E] border-[#03045E]/30')}`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={resolveModal.days}
                onChange={(e) => setResolveModal({ ...resolveModal, days: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border-2 font-bold text-sm mb-4 outline-none ${isDark ? 'bg-black text-white border-white/30 focus:border-white' : 'bg-white text-[#03045E] border-[#03045E]/30 focus:border-[#2C7FFF]'}`}
                placeholder="Custom days"
              />
              <p className={`text-[10px] font-bold mb-5 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>
                Account will be disabled for <strong className={isDark ? 'text-white' : 'text-[#DC2626]'}>{resolveModal.days} day{Number(resolveModal.days) !== 1 ? 's' : ''}</strong> and auto-restored after expiry.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setResolveModal({ isOpen: false, ticket: null, days: 7 })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition cursor-pointer ${isDark ? 'text-white border-white hover:bg-white hover:text-black' : 'text-[#03045E] border-[#03045E] hover:bg-[#03045E] hover:text-white'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveWithPenalty}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 bg-[#DC2626] text-white border-[#DC2626] hover:bg-[#b91c1c] transition cursor-pointer"
                >
                  Confirm Disable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}