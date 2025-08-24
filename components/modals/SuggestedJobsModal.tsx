import React from 'react';
import Modal from '../Modal';

// Mock data
const mockJobs = [
    { id: 1, title: 'Registered Nurse (ICU)', company: 'City General Hospital', location: 'New York, NY', url: '#' },
    { id: 2, title: 'Travel Nurse - ER', company: 'Cross Country Nurses', location: 'San Francisco, CA (Remote option)', url: '#' },
    { id: 3, title: 'Pediatric Nurse Practitioner', company: 'Children\'s Health Center', location: 'Chicago, IL', url: '#' },
    { id: 4, title: 'Clinical Nurse Specialist', company: 'State University Hospital', location: 'Austin, TX', url: '#' },
];


interface SuggestedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestedJobsModal: React.FC<SuggestedJobsModalProps> = ({ isOpen, onClose }) => {
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Suggested Jobs">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-3">
                {mockJobs.length > 0 ? mockJobs.map(job => (
                     <div key={job.id} className="bg-background dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border animate-fade-in-up transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02]">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{job.title}</h3>
                                <p className="text-sm text-primary dark:text-primary-light">{job.company}</p>
                                <p className="mt-1 text-xs text-text-secondary dark:text-dark-text-secondary">{job.location}</p>
                            </div>
                             <a 
                                href={job.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-primary-gradient text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-md"
                             >
                                View Job
                             </a>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-text-secondary dark:text-dark-text-secondary">No job suggestions at the moment. Check back later!</p>
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

export default SuggestedJobsModal;