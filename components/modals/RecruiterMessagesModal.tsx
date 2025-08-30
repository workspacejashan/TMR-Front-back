import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, MessageAuthor } from '../../types';
import { SendIcon, LockClosedIcon, CloseIcon, ArrowLeftIcon } from '../icons/Icons';

interface RecruiterMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
}

const ConversationMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isMe = message.author === MessageAuthor.USER;
  const messageClass = isMe
    ? 'bg-primary text-white self-end rounded-br-none'
    : 'bg-slate-200 dark:bg-dark-border text-text-primary dark:text-dark-text-primary self-start rounded-bl-none';

  return (
    <div className={`w-full flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-auto max-w-md`}>
        <div className={`rounded-lg p-3 text-sm ${messageClass}`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

const RecruiterMessagesModal: React.FC<RecruiterMessagesModalProps> = ({ isOpen, onClose, conversations, onSendMessage }) => {
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsOpen = useRef(isOpen);
  
  const selectedConvo = conversations.find(c => c.id === selectedConvoId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvo?.messages]);
  
  useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      // Animate out
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
        document.body.style.overflow = '';
        setSelectedConvoId(null);
      }, 350);
      return () => clearTimeout(timer);
    }
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimatingOut(false); // Ensure this is false on open
      if (selectedConvo?.status === 'accepted') {
        inputRef.current?.focus();
      }
    }

    prevIsOpen.current = isOpen;

    return () => {
      // Unmount cleanup
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedConvo]);

  const handleSend = () => {
    if (input.trim() && selectedConvoId) {
      onSendMessage(selectedConvoId, input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-0 md:p-4 flex justify-center items-center ${isOpen ? 'modal-enter' : 'modal-exit'}`}>
      <div className={`w-full h-full md:max-w-4xl md:h-[80vh] bg-surface dark:bg-dark-surface md:rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isOpen ? 'full-modal-content-enter' : 'full-modal-content-exit'}`}>
        <header className="p-4 flex justify-between items-center border-b border-border dark:border-dark-border flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Messages</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon className="w-5 h-5"/>
          </button>
        </header>

        <div className="flex-grow flex min-h-0 relative overflow-hidden">
          {/* Conversation List */}
          <aside className={`w-full md:w-1/3 flex-shrink-0 border-r border-border dark:border-dark-border overflow-y-auto transition-transform duration-300 ease-in-out absolute inset-0 md:static ${selectedConvoId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
            {conversations.map(convo => (
              <div
                key={convo.id}
                onClick={() => setSelectedConvoId(convo.id)}
                className={`p-3 cursor-pointer border-b border-border dark:border-dark-border/50 flex items-center gap-3 transition-colors ${selectedConvoId === convo.id ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-slate-50 dark:hover:bg-dark-surface/50'}`}
              >
                <img src={convo.other_participant.profile_photo_url || ''} alt={convo.other_participant.name || ''} className="w-10 h-10 rounded-full object-cover"/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary dark:text-dark-text-primary truncate">{convo.other_participant.name}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">{convo.messages.slice(-1)[0]?.text}</p>
                </div>
              </div>
            ))}
          </aside>

          {/* Chat Window */}
          <main className={`absolute inset-0 md:static w-full md:w-2/3 flex flex-col bg-slate-50 dark:bg-dark-background/50 transition-transform duration-300 ease-in-out ${selectedConvoId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            {selectedConvo ? (
              <>
                <div className="p-3 border-b border-border dark:border-dark-border flex-shrink-0 flex items-center gap-3 bg-surface dark:bg-dark-surface">
                  <button onClick={() => setSelectedConvoId(null)} className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-border text-text-secondary">
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <img src={selectedConvo.other_participant.profile_photo_url || ''} alt={selectedConvo.other_participant.name || ''} className="w-8 h-8 rounded-full object-cover"/>
                  <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{selectedConvo.other_participant.name}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConvo.messages.map(msg => <ConversationMessage key={msg.id} message={msg} />)}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-border dark:border-dark-border bg-surface dark:bg-dark-surface">
                  {selectedConvo.status === 'accepted' ? (
                    <div className="relative">
                        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-primary focus:border-primary" />
                        <button onClick={handleSend} className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary-gradient text-white rounded-full p-2 disabled:bg-slate-400 transition-all transform hover:scale-105 shadow-md">
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                  ) : (
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-yellow-700 dark:text-yellow-300 text-xs font-medium flex items-center justify-center gap-2">
                        <LockClosedIcon className="w-4 h-4"/>
                        Waiting for {selectedConvo.other_participant.name} to accept your request.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden flex-1 md:flex items-center justify-center">
                <p className="text-text-secondary dark:text-dark-text-secondary">Select a conversation to start chatting.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RecruiterMessagesModal;