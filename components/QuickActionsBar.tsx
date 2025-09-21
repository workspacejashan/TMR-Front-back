import React from 'react';
import { Action, ModalType } from '../types';
import { 
    BriefcaseIcon, 
    ChatBubbleLeftRightIcon, 
    ClockIcon, 
    FileIcon, 
    SparklesIcon,
    MagnifyingGlassIcon,
    IdCardIcon,
    UsersIcon,
    SlidersIcon,
    LogoutIcon
} from './icons/Icons';

interface QuickActionsBarProps {
  actions: Action[];
  onQuickActionClick: (action: Action) => void;
  isLoading: boolean;
}

const getActionIcon = (action: Action): React.ReactNode => {
    const iconClass = "w-5 h-5";

    // Recruiter actions
    if (action.type === 'start_flow' && action.payload?.flowName === 'find_candidates') {
        return <MagnifyingGlassIcon className={iconClass} />;
    }
    if (action.payload?.modalType === ModalType.RECRUITER_MESSAGES) {
        return <ChatBubbleLeftRightIcon className={iconClass} />;
    }

    // Candidate actions
    switch (action.payload?.modalType) {
        case ModalType.PUBLIC_PROFILE:
            return <IdCardIcon className={iconClass} />;
        case ModalType.CANDIDATE_MESSAGES:
             return <ChatBubbleLeftRightIcon className={iconClass} />;
        case ModalType.RECRUITER_REQUESTS:
            return <UsersIcon className={iconClass} />;
        case ModalType.SUGGESTED_JOBS:
            return <BriefcaseIcon className={iconClass} />;
        case ModalType.DOCUMENTS_UPLOAD:
            return <FileIcon className={iconClass} />;
        case ModalType.SKILLS_ASSESSMENT:
            return <SparklesIcon className={iconClass} />;
        case ModalType.AVAILABILITY:
            return <ClockIcon className={iconClass} />;
        case ModalType.JOB_PREFERENCES:
            return <SlidersIcon className={iconClass} />;
        default:
            break;
    }

    if (action.type === 'logout') {
        return <LogoutIcon className={iconClass} />;
    }

    return null;
};


const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ actions, onQuickActionClick, isLoading }) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t-2 border-primary/20 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-dark-surface dark:to-dark-surface/80 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-3 px-1">What would you like to do?</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {actions.map((action, index) => {
                const isLogout = action.type === 'logout';
                const buttonClasses = isLogout 
                    ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-400 dark:hover:border-red-500"
                    : "bg-surface dark:bg-dark-border text-text-primary dark:text-dark-text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/80 dark:hover:border-primary-light";
                
                return (
                    <button
                        key={index}
                        onClick={() => onQuickActionClick(action)}
                        disabled={isLoading}
                        className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border border-border dark:border-dark-border/50 shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm ${buttonClasses}`}
                    >
                        <div className="flex items-center justify-center h-8 w-8 mb-2">
                             {getActionIcon(action)}
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap">{action.label}</span>
                    </button>
                );
            })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
