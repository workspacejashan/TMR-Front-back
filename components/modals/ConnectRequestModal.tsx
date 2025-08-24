import React, { useState } from 'react';
import Modal from '../Modal';
import { CandidateProfile } from '../../types';
import { SendIcon } from '../icons/Icons';

interface ConnectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  onSend: (message: string) => void;
}

const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({ isOpen, onClose, candidate, onSend }) => {
  const [message, setMessage] = useState(`Hi ${candidate.name}, I came across your profile and was impressed with your experience. I'm hiring for a role that seems like a great fit and would love to connect to discuss it further.`);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Connect with ${candidate.name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-dark-surface/50 rounded-lg border border-border dark:border-dark-border">
          <img src={candidate.profile_photo_url || ''} alt={candidate.name || 'Candidate'} className="w-14 h-14 rounded-full object-cover" />
          <div>
            <h3 className="font-bold text-text-primary dark:text-dark-text-primary">{candidate.name}</h3>
            <p className="text-sm text-primary dark:text-primary-light">{candidate.title}</p>
          </div>
        </div>
        <div>
          <label htmlFor="connect-message" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Initial Message
          </label>
          <textarea
            id="connect-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="Let them know why you're reaching out..."
          />
        </div>
        <div className="pt-2 flex justify-end gap-3">
            <button
                onClick={onClose}
                className="bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
            >
                Cancel
            </button>
            <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="bg-primary-gradient text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 disabled:bg-slate-400 disabled:shadow-none disabled:transform-none"
            >
                <SendIcon className="w-5 h-5" />
                Send Request
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectRequestModal;