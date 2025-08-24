import React from 'react';
import Modal from '../Modal';
import { Conversation } from '../../types';

interface RecruiterRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: Conversation[];
  onApprove: (conversationId: string) => void;
  onDeny: (conversationId: string) => void;
}

const RecruiterRequestsModal: React.FC<RecruiterRequestsModalProps> = ({ isOpen, onClose, requests, onApprove, onDeny }) => {
    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recruiter Requests">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-3">
                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                    <div key={req.id} className="bg-background dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border animate-fade-in-up">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <img src={req.other_participant.profile_photo_url || ''} alt={req.other_participant.name || ''} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{req.other_participant.name}</h3>
                                    <p className="text-sm text-primary dark:text-primary-light">Wants to connect</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
                                Pending
                            </span>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <button onClick={() => onApprove(req.id)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors transform hover:scale-105">Approve</button>
                            <button onClick={() => onDeny(req.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors transform hover:scale-105">Deny</button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-text-secondary dark:text-dark-text-secondary py-6">You have no pending recruiter requests.</p>
                )}
            </div>
             <div className="pt-6">
                <button
                    onClick={onClose}
                    className="w-full bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default RecruiterRequestsModal;
