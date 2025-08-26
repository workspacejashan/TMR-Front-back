import React from 'react';
import Modal from '../Modal';
import { Job } from '../../types';
import { BuildingOfficeIcon, MapPinIcon } from '../icons/Icons';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job }) => {
  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Job Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{job.title}</h2>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6 gap-y-2 text-sm text-text-secondary dark:text-dark-text-secondary">
            <p className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4 text-primary" /> {job.company}</p>
            <p className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4 text-primary" /> {job.location}</p>
          </div>
        </div>

        <div className="border-t border-border dark:border-dark-border pt-4 max-h-[40vh] overflow-y-auto pr-2">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">Job Description</h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-primary-gradient text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
          >
            Apply Now
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default JobDetailsModal;
