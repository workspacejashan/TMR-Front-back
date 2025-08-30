import React, { useState } from 'react';
import { BotIcon, BuildingOfficeIcon, ChatBubbleLeftRightIcon, UsersIcon } from './icons/Icons';
import { Message, Action, CandidateProfile, ModalType } from '../types';
import ChatWindow from './ChatWindow';
import CandidateCard from './CandidateCard';

interface RecruiterDashboardProps {
    messages: Message[];
    isLoading: boolean;
    sendMessage: (text: string) => void;
    onActionClick: (action: Action) => void;
    onViewProfile: (candidate: CandidateProfile) => void;
    quickActions: Action[];
    foundCandidates: CandidateProfile[];
}

const RecruiterHeader: React.FC = () => (
    <div className="flex items-center space-x-3">
        <BotIcon className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
            ThatsMyRecruiter
            </h1>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center gap-1.5">
                <BuildingOfficeIcon className="w-3.5 h-3.5"/> Recruiter Dashboard
            </p>
        </div>
    </div>
);

const BottomNavItem: React.FC<{label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; badgeCount?: number;}> = 
({ label, icon, isActive, onClick, badgeCount = 0 }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-24 h-14 rounded-lg transition-colors relative ${isActive ? 'text-primary' : 'text-text-secondary dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-border'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {badgeCount > 0 && (
                <span className="absolute top-1 right-5 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-surface dark:ring-dark-surface">
                    {badgeCount}
                </span>
            )}
            <div className={`w-6 h-6 mb-0.5 ${isActive ? 'text-primary' : ''}`}>{icon}</div>
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ messages, isLoading, sendMessage, onActionClick, onViewProfile, quickActions, foundCandidates }) => {
    const [activeView, setActiveView] = useState<'chat' | 'candidates'>('chat');

    const handleAction = (action: Action) => {
        if (action.type === 'open_modal' && action.payload?.modalType === ModalType.FOUND_CANDIDATES) {
            setActiveView('candidates');
        } else {
            onActionClick(action);
        }
    };

    const candidatesContent = (
         <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-surface/50">
             <div className="p-4 border-b border-border dark:border-dark-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    {foundCandidates.length > 0 ? `Found Candidates (${foundCandidates.length})` : 'Candidate Search'}
                </h2>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    {foundCandidates.length > 0 ? 'Review the profiles below' : 'Find profiles matching your criteria.'}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {foundCandidates.length > 0 ? (
                    <div className="space-y-4">
                        {foundCandidates.map(candidate => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                onViewProfile={onViewProfile}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background dark:bg-dark-surface rounded-xl border border-dashed border-border dark:border-dark-border">
                        <BotIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Find Your Next Hire</h3>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                            Use the chat to start a new search. Found candidates will be displayed here for you to review.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-full bg-background dark:bg-dark-background flex-col lg:flex-row">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-0 lg:border-r lg:border-border lg:dark:border-dark-border">
                {/* Mobile View */}
                <div className="lg:hidden flex-1 flex flex-col min-h-0">
                    {activeView === 'chat' && (
                        <ChatWindow
                            messages={messages}
                            isLoading={isLoading}
                            sendMessage={sendMessage}
                            onActionClick={handleAction}
                            headerContent={<RecruiterHeader />}
                            quickActions={quickActions}
                        />
                    )}
                    {activeView === 'candidates' && candidatesContent}
                </div>
                 {/* Desktop Chat View */}
                <div className="hidden lg:flex flex-col h-full">
                    <ChatWindow
                        messages={messages}
                        isLoading={isLoading}
                        sendMessage={sendMessage}
                        onActionClick={onActionClick}
                        headerContent={<RecruiterHeader />}
                        quickActions={quickActions}
                    />
                </div>
            </main>

            {/* Desktop Candidates Sidebar */}
            <aside className="w-full lg:w-1/3 lg:max-w-sm h-full flex-shrink-0 hidden lg:flex flex-col">
                {candidatesContent}
            </aside>
            
            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden border-t border-border dark:border-dark-border bg-surface dark:bg-dark-surface p-2 flex justify-around items-center">
                 <BottomNavItem 
                    label="Chat"
                    icon={<ChatBubbleLeftRightIcon />}
                    isActive={activeView === 'chat'}
                    onClick={() => setActiveView('chat')}
                 />
                 <BottomNavItem 
                    label="Candidates"
                    icon={<UsersIcon />}
                    isActive={activeView === 'candidates'}
                    onClick={() => setActiveView('candidates')}
                    badgeCount={foundCandidates.length > 0 ? foundCandidates.length : 0}
                 />
            </nav>
        </div>
    );
};

export default RecruiterDashboard;