// src/Pages/ChatPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

interface Message {
  _id: string;
  senderModel: "Brand" | "Influencer";
  sender: { _id: string; name: string; avatar?: string };
  text?: string;
  files?: string[];
  createdAt: string;
}

interface ConversationInfo {
  _id: string;
  campaign: { _id: string; title: string };
  brand: { _id: string; name: string; avatar?: string; lastSeen?: string };
  influencer: { _id: string; name: string; avatar?: string; lastSeen?: string };
}

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [input, setInput] = useState("");
  const [uploads, setUploads] = useState<File[]>([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token =
    localStorage.getItem("brandToken") ||
    localStorage.getItem("influencerToken");

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversation + messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      const res = await axios.get<ConversationInfo>(
        `${API_BASE}/api/chat/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversation(res.data);
    };

    const fetchMessages = async () => {
      const res = await axios.get<Message[]>(
        `${API_BASE}/api/chat/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    };

    fetchConversation();
    fetchMessages();

    // Polling every 3s (replace with WebSocket later)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId, token]);

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>(
    (acc, msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    },
    {}
  );

  const handleSend = async () => {
    if (!input.trim() && uploads.length === 0) return;

    const formData = new FormData();
    formData.append("text", input);
    uploads.forEach((file) => formData.append("files", file));

    const res = await axios.post<Message>(
      `${API_BASE}/api/chat/${conversationId}/send`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages((prev) => [...prev, res.data]);
    setInput("");
    setUploads([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploads(Array.from(e.target.files));
    }
  };

  if (!conversation) return <div>Loading chat...</div>;

  const otherUser =
    localStorage.getItem("brandToken") !== null
      ? conversation.influencer
      : conversation.brand;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
        <img
          src={otherUser.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold">{otherUser.name}</div>
          <div className="text-xs text-gray-500">
            {typing
              ? "Typing..."
              : otherUser.lastSeen
              ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString()}`
              : "Online"}
          </div>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          Campaign:{" "}
          <span className="font-medium">{conversation.campaign.title}</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-400 my-2">{date}</div>
            {msgs.map((m) => (
              <div
                key={m._id}
                className={`flex items-end gap-2 ${
                  m.senderModel === "Brand" ? "justify-end" : "justify-start"
                }`}
              >
                {m.senderModel === "Influencer" && (
                  <img
                    src={m.sender.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`max-w-xs p-3 rounded-2xl shadow ${
                    m.senderModel === "Brand"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {m.text && <div>{m.text}</div>}
                  {m.files &&
                    m.files.map((f, i) => (
                      <a
                        key={i}
                        href={f}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 underline text-sm"
                      >
                        {f.endsWith(".jpg") || f.endsWith(".png") ? (
                          <img src={f} alt="attachment" className="w-32 rounded-lg" />
                        ) : (
                          "📎 " + f.split("/").pop()
                        )}
                      </a>
                    ))}
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                {m.senderModel === "Brand" && (
                  <img
                    src={m.sender.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Composer */}
      <footer className="p-4 flex gap-2 border-t bg-white">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer bg-gray-200 px-3 py-2 rounded-lg"
        >
          📎
        </label>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setTyping(true);
            setTimeout(() => setTyping(false), 2000); // mock typing indicator
          }}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white rounded-lg px-4 py-2"
        >
          Send
        </button>
      </footer>
    </div>
  );
};

export default ChatPage;
