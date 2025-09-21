import React, { useState } from 'react';
import { BotIcon, BuildingOfficeIcon, ChatBubbleLeftRightIcon, UsersIcon } from './icons/Icons';
import { Message, Action, CandidateProfile } from '../types';
import ChatWindow from './ChatWindow';
import CandidateCard from './CandidateCard';

interface RecruiterDashboardProps {
    messages: Message[];
    isLoading: boolean;
    onActionClick: (action: Action) => void;
    onQuickActionClick: (action: Action) => void;
    onViewProfile: (candidate: CandidateProfile) => void;
    quickActions: Action[];
    sourcedCandidates: CandidateProfile[];
    contactedCandidates: CandidateProfile[];
    engagedCandidates: CandidateProfile[];
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

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ 
    messages, isLoading, onActionClick, onQuickActionClick, onViewProfile, quickActions, 
    sourcedCandidates, contactedCandidates, engagedCandidates 
}) => {
    const [activeView, setActiveView] = useState<'chat' | 'candidates'>('chat');
    const [activePipelineTab, setActivePipelineTab] = useState<'sourced' | 'contacted' | 'engaged'>('sourced');

    const renderCandidateList = (candidates: CandidateProfile[], emptyMessage: string) => {
        if (candidates.length > 0) {
            return candidates.map(c => <CandidateCard key={c.id} candidate={c} onViewProfile={onViewProfile} />)
        }
        return <div className="text-center p-4 text-sm text-text-secondary dark:text-dark-text-secondary">{emptyMessage}</div>;
    };

    const candidatesContent = (
         <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-surface/50">
             <div className="p-4 border-b border-border dark:border-dark-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    Candidate Pipeline
                </h2>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                    Manage candidates from sourced to engaged.
                </p>
            </div>

            {/* Card-like tab navigation */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b border-border dark:border-dark-border flex-shrink-0 bg-background dark:bg-dark-background/30">
                <button
                    onClick={() => setActivePipelineTab('sourced')}
                    className={`p-3 text-left rounded-xl transition-all border-2 transform hover:-translate-y-0.5 ${activePipelineTab === 'sourced' ? 'bg-primary/5 border-primary shadow-md' : 'bg-surface dark:bg-dark-surface border-transparent hover:border-slate-200 dark:hover:border-dark-border'}`}
                >
                    <p className="font-bold text-2xl text-text-primary dark:text-dark-text-primary">{sourcedCandidates.length}</p>
                    <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Sourced</p>
                </button>
                <button
                    onClick={() => setActivePipelineTab('contacted')}
                    className={`p-3 text-left rounded-xl transition-all border-2 transform hover:-translate-y-0.5 ${activePipelineTab === 'contacted' ? 'bg-primary/5 border-primary shadow-md' : 'bg-surface dark:bg-dark-surface border-transparent hover:border-slate-200 dark:hover:border-dark-border'}`}
                >
                    <p className="font-bold text-2xl text-text-primary dark:text-dark-text-primary">{contactedCandidates.length}</p>
                    <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Contacted</p>
                </button>
                <button
                    onClick={() => setActivePipelineTab('engaged')}
                    className={`p-3 text-left rounded-xl transition-all border-2 transform hover:-translate-y-0.5 ${activePipelineTab === 'engaged' ? 'bg-primary/5 border-primary shadow-md' : 'bg-surface dark:bg-dark-surface border-transparent hover:border-slate-200 dark:hover:border-dark-border'}`}
                >
                    <p className="font-bold text-2xl text-text-primary dark:text-dark-text-primary">{engagedCandidates.length}</p>
                    <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Engaged</p>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activePipelineTab === 'sourced' && renderCandidateList(sourcedCandidates, "Use the chat to find new candidates.")}
                {activePipelineTab === 'contacted' && renderCandidateList(contactedCandidates, "No pending connection requests.")}
                {activePipelineTab === 'engaged' && renderCandidateList(engagedCandidates, "No engaged candidates yet.")}
            </div>
        </div>
    );

    return (
        <div className="flex h-full w-full bg-background dark:bg-dark-background flex-col lg:flex-row">
            <main className="flex-1 flex flex-col min-h-0 lg:border-r lg:border-border lg:dark:border-dark-border">
                {/* Mobile View */}
                <div className="lg:hidden flex-1 flex flex-col min-h-0">
                    {activeView === 'chat' && (
                        <ChatWindow
                            messages={messages}
                            isLoading={isLoading}
                            onActionClick={onActionClick}
                            onQuickActionClick={onQuickActionClick}
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
                        onActionClick={onActionClick}
                        onQuickActionClick={onQuickActionClick}
                        headerContent={<RecruiterHeader />}
                        quickActions={quickActions}
                    />
                </div>
            </main>

            {/* Desktop Candidates Sidebar */}
            <aside className="w-full lg:w-[30rem] h-full flex-shrink-0 hidden lg:flex flex-col">
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
                    badgeCount={sourcedCandidates.length}
                 />
            </nav>
        </div>
    );
};

export default RecruiterDashboard;
