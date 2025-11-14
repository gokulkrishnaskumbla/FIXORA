import React, { useEffect, useState, useRef } from "react";
import { getMessagesForRequest, sendMessage } from "../../assistance/messageAssistance";
import { useParams, useLocation } from "react-router-dom";
import { User } from "lucide-react";

export default function ConversationView() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const location = useLocation();
  const other = location.state?.other || null;

  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?._id || u?.id || null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getMessagesForRequest(requestId);
      setMessages(res.data?.messages || []);
      scrollToEnd();
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const payload = {
        serviceRequestId: requestId,
        receiverId: other?.id || null,
        receiverModel: other?.model || null,
        message: text,
      };

      await sendMessage(payload);
      setText("");
      fetchMessages();
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col h-[90vh] bg-linear-to-b from-base-200 to-base-100">

      {/* Header */}
      <div className="p-4 bg-primary text-primary-content flex items-center gap-3 shadow">
        <div className="bg-white/20 p-2 rounded-full">
          <User className="text-white" size={24} />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{other?.name || "Chat"}</h2>
          <p className="text-sm opacity-80">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-base-content/60 mt-10">
            No messages yet
          </div>
        ) : (
          messages.map((m) => {
            const isOwn = String(m.sender?._id || m.sender) === String(currentUserId);
            return (
              <div
                key={m._id}
                className={`flex w-full ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Other user icon */}
                {!isOwn && (
                    <div className="bg-linear-to-br from-primary/10 to-base-200 rounded-full p-2 self-end mr-2">
                    <User size={16} className="text-base-content/70" />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-xs md:max-w-sm px-3 py-2 rounded-2xl shadow text-sm ${
                    isOwn
                      ? "bg-primary text-primary-content rounded-br-none"
                        : "bg-linear-to-br from-primary/10 to-base-200 text-base-content rounded-bl-none"
                  }`}
                >
                  <div>{m.message}</div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isOwn ? "text-primary-content/70" : "text-base-content/60"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Your user icon */}
                {isOwn && (
                  <div className="bg-primary/20 rounded-full p-2 self-end ml-2">
                    <User size={16} className="text-primary" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input Section */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-linear-to-br from-primary/10 to-base-200 flex items-center gap-2 border-t border-base-300"
      >
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary px-6">
          Send
        </button>
      </form>
    </div>
  );
}
