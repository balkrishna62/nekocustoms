import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function ChatApp() {
  const { user } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const activeChatRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    fetchUsers();

    socketRef.current = io('/', { path: '/socket.io' });
    socketRef.current.emit('join_portal', user.id);

    socketRef.current.on('receive_message', (msg) => {
      setMessages(prev => {
        const currentActiveChat = activeChatRef.current;
        const isGlobalView = currentActiveChat === null;
        const msgIsGlobal = msg.receiver_id === null;
        
        if (isGlobalView && msgIsGlobal) return [...prev, msg];
        
        if (!isGlobalView && !msgIsGlobal) {
          const involvesActivePartner = msg.sender_id === currentActiveChat.id || msg.receiver_id === currentActiveChat.id;
          if (involvesActivePartner) return [...prev, msg];
        }
        return prev;
      });
      scrollToBottom();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeChat === null) {
      fetchGlobalHistory();
    } else {
      fetchPrivateHistory(activeChat.id);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const allUsers = await res.json();
      setUsers(allUsers.filter(u => u.id !== user.id));
    }
  };

  const fetchGlobalHistory = async () => {
    const res = await fetch('/api/portal/chat/global', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      setMessages(await res.json());
      scrollToBottom();
    }
  };

  const fetchPrivateHistory = async (otherUserId) => {
    const res = await fetch(`/api/portal/chat/${otherUserId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      setMessages(await res.json());
      scrollToBottom();
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const data = {
      sender_id: user.id,
      receiver_id: activeChat ? activeChat.id : null,
      message: messageInput.trim()
    };

    socketRef.current.emit('send_message', data);
    setMessageInput('');
  };

  return (
    <div className="portal-chat-layout">
      
      {/* Sidebar Contacts */}
      <div className="portal-chat-contacts-bar">
        <div className="portal-chat-contacts-header">
          <h3 className="portal-chat-contacts-title">Conversations</h3>
        </div>
        <div className="portal-chat-contacts-list">
          
          <div 
            onClick={() => setActiveChat(null)}
            className={`portal-chat-contact-item ${activeChat === null ? 'active' : ''}`}
          >
            <div className="portal-chat-avatar portal-chat-avatar-global">🌍</div>
            <div>
              <div className="portal-contact-name">Global Group</div>
              <div className="portal-contact-desc">All staff</div>
            </div>
          </div>

          <div className="portal-nav-section-title" style={{ padding: '12px 14px 6px', fontSize: '10px' }}>Direct Messages</div>
          
          {users.map(u => (
            <div 
              key={u.id}
              onClick={() => setActiveChat(u)}
              className={`portal-chat-contact-item ${activeChat?.id === u.id ? 'active' : ''}`}
            >
              <div className="portal-chat-avatar">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="portal-contact-name">{u.username}</div>
                <div className="portal-contact-desc">{u.role}</div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Main Chat Area */}
      <div className="portal-chat-window">
        <div className="portal-chat-header">
          <div className={`portal-chat-avatar ${!activeChat ? 'portal-chat-avatar-global' : ''}`}>
            {activeChat ? activeChat.username.charAt(0).toUpperCase() : '🌍'}
          </div>
          <div>
            <h2 className="portal-chat-title">
              {activeChat ? activeChat.username : 'Global Portal Chat'}
            </h2>
            <p className="portal-chat-subtitle">
              {activeChat ? `Role: ${activeChat.role}` : 'Messages visible to everyone'}
            </p>
          </div>
        </div>

        <div className="portal-chat-messages">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id || idx} className={`portal-msg-wrapper ${isMe ? 'portal-msg-wrapper-me' : 'portal-msg-wrapper-other'}`}>
                <div className="portal-msg-meta">
                  {isMe ? 'You' : msg.sender_name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`portal-msg-bubble ${isMe ? 'portal-msg-bubble-me' : 'portal-msg-bubble-other'}`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="portal-chat-input-bar">
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={messageInput} 
            onChange={e => setMessageInput(e.target.value)}
            className="portal-chat-input"
          />
          <button type="submit" className="portal-chat-send-btn">
            Send
          </button>
        </form>
      </div>

    </div>
  );
}
