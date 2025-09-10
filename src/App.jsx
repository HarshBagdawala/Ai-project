import React, { useState, useEffect } from 'react';
import './App.css';

// Main App component containing all the logic and UI
const App = () => {
  // State to manage chat messages, user input, and loading status
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API configuration
  const apiKey = "AIzaSyDce8sMHTXjy5i4LcnQHVM6pRUdmIt8vJs";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // Add initial bot message when the component mounts
  useEffect(() => {
    setMessages([
      { text: "Hello! I can help you with a business idea, brand names, and marketing copy. Tell me about your industry, budget, and desired tone (e.g., 'funny', 'professional').", sender: 'bot' }
    ]);
  }, []);

  // Function to process user input and call the API
  const sendMessage = async () => {
    const userText = userInput.trim();
    if (!userText) return;

    setMessages(prevMessages => [...prevMessages, { text: userText, sender: 'user' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are a creative marketing expert. Based on the provided industry, budget, and tone, create a new business idea, 3 brand names, and 2 catchy marketing slogans. Provide all information in English. The format should be as follows:
            
            **Business Idea:**
            [Concept in one paragraph]
            
            **Brand Names:**
            [3 distinct names]
            
            **Marketing Slogans:**
            [2 short and catchy slogans]
            `;
      const payload = {
        contents: [{ parts: [{ text: userText }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No content received from the API.");
      }

      setIsLoading(false);
      setMessages(prevMessages => [...prevMessages, { text: generatedText, sender: 'bot', isHTML: true }]);
    } catch (error) {
      console.error("Error generating business idea:", error);
      setIsLoading(false);
      setMessages(prevMessages => [...prevMessages, { text: "Sorry, something went wrong. Please try again.", sender: 'bot' }]);
    }
  };

  // Component for a single message
  const Message = ({ message }) => {
    return (
      <div className={`message ${message.sender}`}>
        {message.isHTML ? (
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }} />
        ) : (
          <p>{message.text}</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="app-wrapper">
        <div className="container">
          <div className="header">
            Small Business Idea Generator
          </div>
          <div id="chat-box" className="chat-box">
            {messages.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="loading-message">
                <div className="animate-spin"></div>
                <p>Thinking...</p>
              </div>
            )}
          </div>
          <div className="input-area">
            <input
              type="text"
              id="userInput"
              className="input-area-input"
              placeholder="Enter your industry, budget, and tone..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  sendMessage();
                }
              }}
            />
            <button
              id="sendBtn"
              className="input-area-button"
              onClick={sendMessage}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
