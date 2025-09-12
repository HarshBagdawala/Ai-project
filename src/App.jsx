import React, { useState, useEffect, useRef } from "react";
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const [budgetInput, setBudgetInput] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedTone, setSelectedTone] = useState("");

  const [currencySymbol, setCurrencySymbol] = useState("$");
  const chatBoxRef = useRef(null);

  // API Config
  const apiKey = "AIzaSyDce8sMHTXjy5i4LcnQHVM6pRUdmIt8vJs";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      const userLocale = navigator.language;
      const formattedPrice = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(0);

      setCurrencySymbol(formattedPrice.replace(/0/g, "").trim());
    } catch {
      setCurrencySymbol("$");
    }
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!budgetInput || !selectedIndustry || !selectedTone) return;

    const initialPrompt = `My industry is ${selectedIndustry}, my budget is ${budgetInput}, and my desired tone is ${selectedTone}.`;
    setMessages([{ text: initialPrompt, sender: "user" }]);
    setIsFormSubmitted(true);
    sendMessage(initialPrompt);
  };

  const sendMessage = async (messageText = userInput) => {
    const userText = messageText.trim();
    if (!userText) return;

    if (messageText === userInput) {
      setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
      setUserInput("");
    }

    setIsLoading(true);
    try {
      const botResponse = await generateContent(userText);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { text: botResponse, sender: "bot", isHTML: true },
      ]);
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Something went wrong, try again!", sender: "bot" },
      ]);
    }
  };

  const generateContent = async (userPrompt) => {
    const systemPrompt = `You are a creative marketing expert...`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const Message = ({ message }) => (
    <div className={`message ${message.sender}`}>
      {message.isHTML ? (
        <div
          dangerouslySetInnerHTML={{
            __html: message.text
              .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
              .replace(/\n/g, "<br />"),
          }}
        />
      ) : (
        <p>{message.text}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="app-wrapper">
        <div className="container">
          <div className="header">💡 Small Business Idea Generator</div>

          {!isFormSubmitted ? (
            <form onSubmit={handleFormSubmit} className="form-container">
              <div className="form-input-group">
                <label className="form-label">Industry</label>
                <select
                  className="form-select"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="" disabled>
                    Select an industry
                  </option>
                  <option value="Technology">Technology</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <div className="form-input-group">
                <label className="form-label">Budget</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder={`e.g. ${currencySymbol}1000`}
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                />
              </div>

              <div className="form-input-group">
                <label className="form-label">Tone</label>
                <select
                  className="form-select"
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                >
                  <option value="" disabled>
                    Select tone
                  </option>
                  <option value="Professional">Professional</option>
                  <option value="Creative">Creative</option>
                  <option value="Humorous">Humorous</option>
                  <option value="Inspirational">Inspirational</option>
                </select>
              </div>

              <button type="submit" className="form-button">
                🚀 Start
              </button>
            </form>
          ) : (
            <>
              <div ref={chatBoxRef} className="chat-box">
                {messages.map((msg, idx) => (
                  <Message key={idx} message={msg} />
                ))}
                {isLoading && (
                  <div className="message bot">🤔 Thinking...</div>
                )}
              </div>
              <div className="input-area">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={() => sendMessage()}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
