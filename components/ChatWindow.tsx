import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { SendIcon, BotIcon } from './icons/Icons';
import { Message, Action } from '../types';
import QuickActionsBar from './QuickActionsBar';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
  onActionClick: (action: Action) => void;
  headerContent?: React.ReactNode;
  quickActions: Action[];
}

const DefaultHeader: React.FC = () => (
    <div className="flex items-center justify-center space-x-3">
        <BotIcon className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
            ThatsMyRecruiter
            </h1>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Your Personal AI Recruiter</p>
        </div>
    </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, sendMessage, onActionClick, headerContent, quickActions }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-dark-background">
      <header className="p-4 border-b border-border dark:border-dark-border flex items-center justify-center bg-surface/80 dark:bg-dark-background/80 backdrop-blur-sm z-10 shadow-sm">
        {headerContent || <DefaultHeader />}
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onActionClick={onActionClick} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-3 animate-fade-in-up pl-2">
            <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-breathing"></div>
            <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-breathing" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-breathing" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
       {quickActions && quickActions.length > 0 && (
        <QuickActionsBar actions={quickActions} onActionClick={onActionClick} />
      )}
      <div className={`p-4 bg-surface dark:bg-dark-surface ${!quickActions || quickActions.length === 0 ? 'border-t border-border dark:border-dark-border' : ''}`}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full bg-background dark:bg-dark-border text-text-primary dark:text-dark-text-primary rounded-full py-3 pl-5 pr-16 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary-gradient text-white rounded-full p-2.5 disabled:bg-slate-300 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:hover:scale-100 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;