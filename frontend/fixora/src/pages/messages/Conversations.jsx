import React, { useEffect, useState } from "react";
import { getConversations } from "../../assistance/messageAssistance";
import { useNavigate } from "react-router-dom";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversations();
      setConversations(res.data?.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      {loading ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-base-content/60">No conversations yet</div>
      ) : (
        <ul className="divide-y">
          {conversations.map((c) => (
            <li
              key={c.requestId}
              className="py-3 cursor-pointer hover:bg-base-200"
              onClick={() => navigate(`/messages/${c.requestId}`, { state: { other: c.otherParticipant } })}
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{c.service?.title || 'Service'}</div>
                  <div className="text-sm text-base-content/70">{c.lastMessage?.message || 'No messages yet'}</div>
                </div>
                <div className="text-sm text-base-content/60">{c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleString() : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
