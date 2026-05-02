import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

import API_URL from "../../config";

function Chatbot({setCart}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Dragging state
  const [position, setPosition] = useState({ right: 25, bottom: 25 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, right: 0, bottom: 0 });
  const isMoved = useRef(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    isMoved.current = false;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      right: position.right,
      bottom: position.bottom
    };
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = dragStartPos.current.x - e.clientX;
    const dy = dragStartPos.current.y - e.clientY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isMoved.current = true;
    }

    setPosition({
      right: dragStartPos.current.right + dx,
      bottom: dragStartPos.current.bottom + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    window.speechSynthesis.speak(msg);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    const token = localStorage.getItem("token");
    try{
        const res = await fetch(`${API_URL}/api/chatbot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ message: text }),
        });


        const data = await res.json();

        const botMessage = {
          from: "bot",
          text: data.reply || data.message || "Please login to use the chatbot.",
          products: data.products || [],
          cart: data.cart || [],
          options: data.options || []
        };
    

        setMessages((prev) => [...prev, botMessage]);
        speak(data.reply);

        if (data.cart) {
          setCart([...data.cart]);
        }
      }
      catch(err){
        alert(err.response?.data.message || "something went wrong");
      }
  };

  

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (e) => {
      sendMessage(e.results[0][0].transcript);
    };
  };

  return (
    <>
      {/* Floating Icon */}
      <div 
        className="chatbot-icon" 
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!isMoved.current) {
            setOpen(!open);
          }
        }}
        style={{ 
          right: `${position.right}px`, 
          bottom: `${position.bottom}px`,
          cursor: isDragging ? 'grabbing' : 'pointer'
        }}
      >
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div 
          className="chatbot-window"
          style={{
            right: `${position.right}px`,
            bottom: `${position.bottom + 65}px`
          }}
        >
          <div className="chatbot-header">
            Grocery Assistant
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}

                {m.options && m.options.length > 0 && (
                  <div className="chatbot-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {m.options.map((opt, index) => (
                      <button 
                        key={index} 
                        style={{ padding: '6px 12px', borderRadius: '15px', border: '1px solid #fc6b03', backgroundColor: 'transparent', color: '#fc6b03', cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => sendMessage(opt)}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fc6b03'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fc6b03'; }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {m.products && m.products.length > 0 && (
                  <div className="product-list">
                    {m.products.map((p, index) => (
                      <div 
                        key={index} 
                        className="product-item" 
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => sendMessage(`add ${p.name} from ${p.shopName || 'unknown'}`)}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <strong>{p.name}</strong> - ₹{p.finalPrice || p.price}
                        {p.shopName && <span style={{display: 'block', fontSize: '0.85em', color: '#666'}}>From: {p.shopName}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {m.cart && m.cart.length > 0 && (
                  <div className="product-list">
                    {m.cart.map((item, index) => (
                      <div key={index} className="product-item">
                        {item.productId.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button onClick={() => sendMessage(input)}>➤</button>
            <button onClick={startListening}>🎤</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
