import React from 'react';
import { Message, MessageAuthor, Action } from '../types';
import { BotIcon } from './icons/Icons';

interface ChatMessageProps {
  message: Message;
  onActionClick: (action: Action) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.author === MessageAuthor.USER;
  
  const messageClass = isUser
    ? 'bg-primary-gradient text-white self-end rounded-br-lg'
    : 'bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary self-start rounded-bl-lg shadow-sm';
  
  const authorIcon = isUser 
    ? <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><i className="fa fa-user text-slate-500 dark:text-slate-400"></i></div>
    : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><BotIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /></div>;
    
  const authorName = isUser ? 'You' : 'Your Recruiter';

  return (
    <div className={`w-full flex gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0 mt-1">
          {authorIcon}
      </div>
      <div className={`w-auto max-w-xl md:max-w-2xl`}>
          <div
            className={`rounded-2xl p-4 ${messageClass}`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          </div>
          {message.actions && message.actions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2 pl-1">
                {message.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onActionClick(action)}
                    className="bg-primary-gradient hover:opacity-90 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
      </div>
    </div>
  );
};

export default ChatMessage;