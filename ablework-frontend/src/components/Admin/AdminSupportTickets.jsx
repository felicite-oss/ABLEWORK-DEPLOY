import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config';

export function AdminSupportTickets({ onTicketResolved }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDark, setIsDark] = useState(false);

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
          
          // Robust parsing logic to handle both JSON arrays and comma-separated strings from the DB
          if (typeof parsedReasons === 'string') {
            try {
              parsedReasons = JSON.parse(parsedReasons);
            } catch (e) {
              parsedReasons = parsedReasons.split(',').map(r => r.trim()).filter(Boolean);
            }
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

  // Simplified Handle Resolve - Just marks the ticket as Resolved
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

  const filteredTickets = tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'Open').length;

  if (isLoading) return <div className={`p-8 font-bold ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Loading tickets...</div>;

  return (
    <div className={`${isDark ? 'bg-black border-white/20' : 'bg-white border-[#03045E]/15'} rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col transition-colors duration-300`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b-2 ${isDark ? 'border-white/10' : 'border-[#03045E]/10'}`}>
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#03045E]'}`}>Support & Reports</h2>
          <p className={`text-sm font-bold mt-1 ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Review user reports and support requests.</p>
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
                <th className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/70' : 'text-[#03045E]/70'}`}>Subject / Reasons</th>
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
  ticket.status === 'Open' ? (isDark ? 'bg-white !text-black' : 'bg-[#2C7FFF] !text-white') : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600')
}`}>
  {ticket.status}
</span>
                    </div>
                    {/* Tags for reasons shown in the list view */}
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
<button
  onClick={() => setSelectedTicket(ticket)}
  className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
    isDark 
      ? 'bg-black !text-white border-white hover:bg-white/10' 
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
                  Submitted by: <span className="text-[#2C7FFF]">{selectedTicket.user_name}</span> ({selectedTicket.user_email}) 
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
              
              {/* DISPLAY REPORT REASONS CLEARLY INSIDE THE MODAL */}
              {Array.isArray(selectedTicket.reasons) && selectedTicket.reasons.length > 0 && (
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Report Reasons Selected:</span>
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-[#2C7FFF]/5 border-[#2C7FFF]/20'}`}>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${
                            isDark
                              ? 'bg-black border-white/20 text-white'
                              : 'bg-white border-[#2C7FFF]/40 text-[#03045E]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2C7FFF]" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${isDark ? 'text-white/60' : 'text-[#03045E]/60'}`}>Detailed Message</span>
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
  className={`px-8 py-3 border-2 text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
    isDark 
      ? 'bg-black !text-white border-white hover:bg-white/10' 
      : 'bg-[#03045E] !text-white border-[#03045E] hover:bg-[#2C7FFF] hover:border-[#2C7FFF]'
  }`}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  Mark as Resolved
</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}