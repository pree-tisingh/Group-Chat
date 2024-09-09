import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ChatDashboard.css';

const ChatComponent = ({ groupId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  
  const sendMessage = async () => {
    if (!newMessage) return;
  
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/messages`,
        {
            message: newMessage,
            userId, 
            senderId: userId, 
          });
    
        

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="chat-component">
      <div className="message-list">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.user.name}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
