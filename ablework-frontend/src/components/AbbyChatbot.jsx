import { useState, useRef, useEffect } from 'react';
import abbyVideo from '../assets/Abby.mp4';

export default function AbbyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'abby', text: 'Hi there! I am Abby, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const dialogRef = useRef(null);


  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const timer = setTimeout(() => {
        dialogRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');

    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    const formattedHistory = messages
      .filter((_, index) => index !== 0) 
      .map(msg => ({
        sender: msg.sender === 'abby' ? 'model' : 'user',
        text: msg.text
      }));

    const storedUserStr = localStorage.getItem('user');
    let userId = null;
    let role = null;
    
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      userId = storedUser.id;
      role = storedUser.role;
    }

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userText, 
          userId: userId, 
          role: role,
          conversationHistory: formattedHistory 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { sender: 'abby', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'abby', text: 'Oops, I encountered an error connecting to my server.' }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { sender: 'abby', text: 'I am offline right now! Please make sure the backend is running.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatText = (text) => {
    return text.split('\n').map((line, lineIndex) => (
      <span key={lineIndex} className="block mb-1 sm:mb-1.5 last:mb-0">
        {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex} className="font-bold text-[#03045E]">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      
      {isOpen && (
        <div 
          ref={dialogRef}
          tabIndex={-1}
          className="bg-[#f4f4f4] w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#03045E]/20 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200 focus:outline-none"
          style={{ height: 'min(500px, 70dvh)', maxHeight: 'calc(100dvh - 6rem)' }}
          role="dialog"
          aria-label="Chat with Abby AI Assistant"
        >
        
          <div className="bg-[#03045E] text-[#f4f4f4] px-3 py-3 sm:px-5 sm:py-4 flex justify-between items-center shrink-0 shadow-md z-10">
            <h2 tabIndex="0" className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2 sm:gap-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 rounded-lg p-1 -m-1 w-fit">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#2C7FFF] flex items-center justify-center bg-[#f4f4f4] shrink-0 pointer-events-none shadow-sm" aria-hidden="true">
                <video 
                  src={abbyVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  disablePictureInPicture
                  controlsList="nodisablepictureinpicture nofullscreen noremoteplayback"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              Abby 
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
              className="text-[#f4f4f4] hover:bg-[#2C7FFF]/30 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-black transition-colors cursor-pointer text-sm sm:text-lg focus:outline-none"
            >
              ✕
            </button>
          </div>

        
          <div 
            className="flex-1 p-2.5 sm:p-4 min-h-0 overflow-y-auto flex flex-col gap-2.5 sm:gap-4 bg-[#f4f4f4]"
            aria-live="polite"
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                tabIndex="0" 
                className={`max-w-[88%] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold leading-relaxed shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2 ${
                  msg.sender === 'user' 
                    ? 'bg-[#2C7FFF] text-[#f4f4f4] self-end rounded-2xl rounded-br-sm' 
                    : 'bg-white border-2 border-[#03045E]/10 text-[#03045E] self-start rounded-2xl rounded-bl-sm'
                }`}
              >
                {msg.sender === 'abby' ? formatText(msg.text) : msg.text}
              </div>
            ))}

          
            {isTyping && (
              <div tabIndex="0" className="bg-white border-2 border-[#03045E]/10 text-[#03045E] self-start px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 animate-pulse transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C7FFF] focus-visible:ring-offset-2">
                <span className="text-[0.625rem] sm:text-xs font-bold text-[#03045E]/70 mr-1">Abby is thinking</span>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#2C7FFF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#2C7FFF] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#2C7FFF] rounded-full animate-bounce"></div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

       
          <form 
            onSubmit={handleSend} 
            className="p-2.5 sm:p-3 border-t-2 border-[#03045E]/10 bg-white flex gap-1.5 sm:gap-2 shrink-0 items-end shadow-inner"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
                  }
                }, 300);
              }}
              disabled={isTyping}
              rows={1}
              placeholder={isTyping ? "Abby is generating response..." : "Ask Abby something..."}
              aria-label="Type your message to Abby"
              className="flex-1 min-w-0 px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-[#03045E]/20 rounded-xl focus:border-[#2C7FFF] focus:ring-1 focus:ring-[#2C7FFF] outline-none text-[#03045E] bg-[#f4f4f4] font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 resize-none overflow-y-auto max-h-[120px] leading-relaxed"
            />
            <button 
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isTyping}
              className="bg-[#2C7FFF] text-[#f4f4f4] px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold hover:bg-[#03045E] transition-colors cursor-pointer text-xs sm:text-sm whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-[#2C7FFF] hover:border-[#03045E] focus:outline-none"
            >
              Send
            </button>
          </form>
        </div>
      )}

      
      {!isOpen && (
        <div className="relative group flex flex-col items-end">
          <span className="absolute bottom-full mb-2 right-0 px-3 py-1.5 rounded-lg bg-[#03045E] text-[#f4f4f4] text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none shadow-lg z-50">
            Abby AI
          </span>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open chat with Abby AI Assistant"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="bg-[#2C7FFF] text-[#f4f4f4] w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_16px_rgba(44,127,255,0.4)] hover:shadow-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer border-[3px] border-[#03045E] relative p-0 pointer-events-auto focus:outline-none"
            style={{ animation: 'sideToSideBounce 2.5s infinite ease-in-out' }}
          >
            <style>{`
              @keyframes sideToSideBounce {
                0%, 100% { transform: translateX(0) translateY(0); }
                25% { transform: translateX(-4px) translateY(-6px); }
                50% { transform: translateX(0) translateY(0); }
                75% { transform: translateX(4px) translateY(-6px); }
              }
            `}</style>
            <video 
              src={abbyVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              disablePictureInPicture
              controlsList="nodisablepictureinpicture nofullscreen noremoteplayback"
              className="w-full h-full object-cover pointer-events-none"
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </div>
  );
}