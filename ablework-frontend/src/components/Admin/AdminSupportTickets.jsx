import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config';

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Open');

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'Open').length;

  if (isLoading) return <div className="p-8 font-bold text-[#03045E]">Loading tickets...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-[#03045E]/15 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-[#03045E]/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#03045E]">Support & Reports</h2>
          <p className="text-sm font-bold text-[#03045E]/70 mt-1">Review user reports and manage account bans.</p>
        </div>
        
        <div className="flex bg-[#f4f4f4] p-1 rounded-lg border border-[#03045E]/10">
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              filter === 'Open' ? 'bg-[#03045E] text-white shadow-sm' : 'text-[#03045E]/70 hover:text-[#03045E]'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              filter === 'Resolved' ? 'bg-[#03045E] text-white shadow-sm' : 'text-[#03045E]/70 hover:text-[#03045E]'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>
      
      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#03045E]/20 rounded-xl bg-[#f4f4f4]">
          <p className="text-[#03045E] font-bold">No {filter.toLowerCase()} tickets found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id} 
              className={`p-5 rounded-xl border-2 transition-all ${
                ticket.status === 'Open' 
                  ? 'border-[#2C7FFF]/40 bg-blue-50/30' // Fixed: Light blue background instead of dark red
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-extrabold text-lg ${ticket.status === 'Open' ? 'text-[#03045E]' : 'text-[#03045E]/70'}`}>
                    {ticket.subject}
                  </h3>
                  <p className="text-xs font-bold text-[#03045E]/70 mt-1">
                    From: <span className="text-[#2C7FFF]">{ticket.user_name}</span> ({ticket.user_email}) 
                    <span className="mx-2">•</span> 
                    Role: {ticket.user_role}
                    <span className="mx-2">•</span> 
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  ticket.status === 'Open' 
                    ? 'bg-[#2C7FFF] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div className={`text-sm p-4 rounded-lg border mt-3 mb-4 whitespace-pre-wrap font-medium ${
                ticket.status === 'Open' 
                  ? 'text-[#03045E] bg-white border-[#03045E]/10' 
                  : 'text-gray-600 bg-white border-gray-200'
              }`}>
                {ticket.message}
              </div>

                            {/* Display Attached Proof Image */}
              {ticket.image_path && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#03045E]/60 block mb-2">Attached Proof:</span>
                  <a 
                    href={ticket.image_path.startsWith('http') ? ticket.image_path : `${API_BASE_URL}/uploads/${ticket.image_path.replace(/^uploads[\\/]/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block relative group"
                  >
                    <img 
                      src={ticket.image_path.startsWith('http') ? ticket.image_path : `${API_BASE_URL}/uploads/${ticket.image_path.replace(/^uploads[\\/]/, '')}`}
                      alt="Proof attachment" 
                      className="max-w-xs max-h-48 object-cover rounded-lg border-2 border-[#03045E]/20 shadow-sm group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                      <span className="text-white font-bold text-xs bg-black/60 px-2 py-1 rounded">Click to enlarge</span>
                    </div>
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {ticket.status === 'Open' && (
                  <button 
                    onClick={() => handleResolve(ticket.id)}
                    className="px-4 py-2 bg-[#2C7FFF] text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-[#03045E] transition-colors cursor-pointer shadow-sm"
                  >
                    Mark as Resolved
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