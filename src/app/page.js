'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const handleChat = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error('Server error: ' + res.status);

      const data = await res.json();
      setChat((prev) => [...prev, { role: 'bot', text: data.response }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: 'bot', text: '❌ Error: ' + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">💬 OpenChat</h1>
          {chat.length > 0 && (
            <button
              onClick={() => setChat([])}
              className="text-sm text-red-500 hover:underline"
            >
              Clear Chat
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {chat.length === 0 && !loading && (
          <div className="text-center mt-20 space-y-3">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center">
              💡
            </div>
            <h2 className="text-2xl font-bold">Start a conversation</h2>
            <p className="text-muted-foreground">
              Ask anything, get help, or chat with AI.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {chat.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${msg.role === 'user'
                ? 'bg-cyan-600 text-white ml-auto'
                : 'bg-white border border-gray-300'
                }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm max-w-none prose-p:mb-2 prose-li:marker:text-cyan-600"
              >
                {msg.text}
              </ReactMarkdown>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border px-4 py-2 rounded-2xl shadow inline-flex space-x-2"
            >
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
            </motion.div>
          )}
        </div>

        <div ref={chatEndRef} />
      </main>

      {/* Input */}
      <footer className="p-4 border-t bg-white shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChat();
          }}
          className="max-w-4xl mx-auto flex items-center space-x-2"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-cyan-700 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-cyan-900 hover:bg-cyan-800 disabled:bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
