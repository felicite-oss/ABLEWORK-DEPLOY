import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config';

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Open');
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
        setSelectedTicket(null); // Close modal after resolving
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'Open').length;

  if (isLoading) return <div className="p-8 font-bold text-[#03045E]">Loading tickets...</div>;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#03045E]/15 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b-2 border-[#03045E]/10">
        <div>
          <h2 className="text-2xl font-black text-[#03045E]">Support & Reports</h2>
          <p className="text-sm font-bold text-[#03045E]/70 mt-1">Review user reports and manage account bans.</p>
        </div>
        
        <div className="flex bg-[#f4f4f4] p-1 rounded-lg border border-[#03045E]/10 shrink-0">
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'Open' ? 'bg-[#03045E] text-white shadow-sm' : 'text-[#03045E]/70 hover:text-[#03045E]'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'Resolved' ? 'bg-[#03045E] text-white shadow-sm' : 'text-[#03045E]/70 hover:text-[#03045E]'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>
      
      {/* Table View */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 m-6 border-2 border-dashed border-[#03045E]/20 rounded-xl bg-[#f4f4f4]">
          <p className="text-[#03045E] font-bold">No {filter.toLowerCase()} tickets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f4f4] border-b-2 border-[#03045E]/10">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Subject</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Reported By</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#03045E]/70">Date Reported</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#03045E]/70 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#03045E]/10">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-[#f4f4f4]/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-black text-[#03045E] truncate max-w-[200px] sm:max-w-xs">{ticket.subject}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      ticket.status === 'Open' ? 'bg-[#2C7FFF] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs font-bold text-[#03045E]">{ticket.user_name}</p>
                    <p className="text-[10px] font-semibold text-[#03045E]/60">{ticket.user_role}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs font-semibold text-[#03045E]/80">
                      {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-semibold text-[#03045E]/60">
                      {new Date(ticket.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-4 py-2 bg-white text-[#2C7FFF] border-2 border-[#2C7FFF] text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-[#2C7FFF] hover:text-white transition-colors cursor-pointer"
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
          style={{ backgroundColor: 'rgba(3, 4, 94, 0.6)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-modal-title"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-[#03045E]/20 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b-2 border-[#03045E]/10 bg-[#f4f4f4]">
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <h2 id="ticket-modal-title" className="text-xl font-black text-[#03045E] break-words">
                    {selectedTicket.subject}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    selectedTicket.status === 'Open' ? 'bg-[#2C7FFF] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#03045E]/70">
                  From: <span className="text-[#2C7FFF]">{selectedTicket.user_name}</span> ({selectedTicket.user_email}) 
                  <span className="mx-2">•</span> 
                  Role: {selectedTicket.user_role}
                  <span className="mx-2">•</span> 
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-lg bg-white text-[#03045E] border-2 border-[#03045E]/20 hover:bg-[#03045E] hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60 block mb-2">Message</span>
                <div className="p-4 rounded-xl border-2 border-[#03045E]/10 bg-white text-[#03045E] text-sm font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.image_path && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#03045E]/60 block mb-2">Attached Proof</span>
                  <a 
                    href={selectedTicket.image_path.startsWith('http') ? selectedTicket.image_path : `${API_BASE_URL}/uploads/${selectedTicket.image_path.replace(/^uploads[\\/]/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block relative group rounded-xl overflow-hidden border-2 border-[#03045E]/20 shadow-sm"
                  >
                    <img 
                      src={selectedTicket.image_path.startsWith('http') ? selectedTicket.image_path : `${API_BASE_URL}/uploads/${selectedTicket.image_path.replace(/^uploads[\\/]/, '')}`}
                      alt="Proof attachment" 
                      className="max-w-full max-h-[300px] object-contain group-hover:opacity-90 transition-opacity bg-[#f4f4f4]"
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
              <div className="p-6 border-t-2 border-[#03045E]/10 bg-[#f4f4f4] flex justify-end gap-3 mt-auto">
                <button 
                  onClick={() => handleResolve(selectedTicket.id)}
                  className="px-6 py-2.5 bg-[#2C7FFF] text-white border-2 border-[#2C7FFF] text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#03045E] transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
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