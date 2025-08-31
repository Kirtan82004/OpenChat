'use client'
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]); // no types needed
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null); // remove <HTMLDivElement>

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleChat = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Server error: " + res.status);

      const data = await res.json();
      setChat((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "❌ Error: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-cyan-900 text-white py-4 shadow-md text-center font-bold text-xl">
        💬 OpenChat
      </header>

      {/* Chat Window */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-gray-900 whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-cyan-600 text-white self-end ml-auto"
                : "bg-white border border-gray-300 self-start"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border px-4 py-2 rounded-2xl shadow self-start inline-flex space-x-2"
          >
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input */}
      <footer className="p-4 bg-white border-t shadow-md flex items-center space-x-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleChat())
          }
          className="flex-1 resize-none border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-cyan-700 outline-none"
          placeholder="Type a message..."
          rows={1}
        />
        <button
          onClick={handleChat}
          disabled={loading || !message.trim()}
          className="bg-cyan-900 hover:bg-cyan-800 disabled:bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
        >
          Send
        </button>
      </footer>
    </div>
  );
}
