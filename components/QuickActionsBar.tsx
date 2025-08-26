import React from 'react';
import { Action } from '../types';

interface QuickActionsBarProps {
  actions: Action[];
  onActionClick: (action: Action) => void;
  isLoading: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ actions, onActionClick, isLoading }) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="p-3 border-t border-border dark:border-dark-border bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm">
      <div className="flex overflow-x-auto space-x-2 pb-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            disabled={isLoading && action.type !== 'logout'}
            className={
                action.type === 'logout'
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 font-semibold py-2 px-4 rounded-full text-sm transition-colors whitespace-nowrap shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-text-primary dark:text-dark-text-primary font-semibold py-2 px-4 rounded-full text-sm transition-colors whitespace-nowrap shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsBar;