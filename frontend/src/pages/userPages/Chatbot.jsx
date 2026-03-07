import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

function Chatbot({setCart}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"
  //const API_URL = "http://localhost:8000";

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
          cart:data.cart || []
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
      <div className="chatbot-icon" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            Grocery Assistant
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}

                {m.products && m.products.length > 0 && (
                  <div className="product-list">
                    {m.products.map((p, index) => (
                      <div key={index} className="product-item">
                        {p.name} - ₹{p.finalPrice || p.price}
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
