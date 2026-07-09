import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import MessageItem from './MessageItem';
import './MessageList.scss';

const MessageList: React.FC = () => {
  const { messages } = useSelector((state: RootState) => state.chat);
  const chatRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat" ref={chatRef}>
      {/* <div className="dayline">今天</div> */}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
