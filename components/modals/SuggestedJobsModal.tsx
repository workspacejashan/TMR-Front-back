import React from 'react';
import Modal from '../Modal';
import { Job } from '../../types';
import { BuildingOfficeIcon, GlobeAltIcon } from '../icons/Icons';

interface SuggestedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  isLoading: boolean;
  openJobDetailsModal: (job: Job) => void;
}

const SuggestedJobsModal: React.FC<SuggestedJobsModalProps> = ({ isOpen, onClose, jobs, isLoading, openJobDetailsModal }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-text-secondary dark:text-dark-text-secondary">Searching for job matches...</p>
                </div>
            );
        }

        if (jobs.length > 0) {
            return jobs.map(job => (
                 <div key={job.id} className="bg-background dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border animate-fade-in-up transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02]">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{job.title}</h3>
                            <p className="text-sm text-primary dark:text-primary-light flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4" /> {job.company}</p>
                            <p className="mt-1 text-xs text-text-secondary dark:text-dark-text-secondary">{job.location}</p>
                        </div>
                         <button 
                            onClick={() => openJobDetailsModal(job)}
                            className="bg-primary-gradient text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-md"
                         >
                            View Job
                         </button>
                    </div>
                </div>
            ));
        }

        return (
             <div className="text-center py-10">
                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">No Job Suggestions Found</h3>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                    We couldn't find any jobs matching your current preferences.
                    <br />
                    Try updating your "Job Preferences" to see more results.
                </p>
            </div>
        )
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Suggested Jobs For You" maxWidth="max-w-2xl">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-3">
                {renderContent()}
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

export default SuggestedJobsModal;