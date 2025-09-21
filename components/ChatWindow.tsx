import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { BotIcon } from './icons/Icons';
import { Message, Action } from '../types';
import QuickActionsBar from './QuickActionsBar';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onActionClick: (action: Action) => void; // For actions inside a message bubble
  onQuickActionClick: (action: Action) => void; // For quick action buttons
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

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onActionClick, onQuickActionClick, headerContent, quickActions }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        <QuickActionsBar 
            actions={quickActions} 
            onQuickActionClick={onQuickActionClick}
            isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default ChatWindow;