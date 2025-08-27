import React, { useState, useEffect, KeyboardEvent } from 'react';
import Modal from '../Modal';
import { JobPostDetails } from '../../types';
import { SparklesIcon, CloseIcon } from '../icons/Icons';

// Re-usable TagInput component, similar to the one in JobPreferencesModal
const TagInput: React.FC<{
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder: string;
    label: string;
}> = ({ tags, setTags, placeholder, label }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && inputValue.trim() !== '') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">{label}</label>
            <div className="mt-1 flex flex-wrap items-center gap-2 p-2 bg-background dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface dark:focus-within:ring-offset-dark-surface focus-within:ring-primary transition">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light text-sm font-medium pl-3 pr-1.5 py-1 rounded-full animate-fade-in-up">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-primary/70 hover:text-primary dark:hover:text-primary-light rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                            <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent focus:outline-none sm:text-sm text-text-primary dark:text-dark-text-primary p-1"
                />
            </div>
        </div>
    );
};


interface FindCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDetails: Partial<JobPostDetails>;
  onSearch: (details: JobPostDetails) => Promise<void>;
  isSearching: boolean;
}

const FindCandidatesModal: React.FC<FindCandidatesModalProps> = ({ isOpen, onClose, initialDetails, onSearch, isSearching }) => {
  const [details, setDetails] = useState<Partial<JobPostDetails>>({ title: '', skills: [], location: '' });

  useEffect(() => {
    if (isOpen) {
      setDetails({
        title: initialDetails.title || '',
        skills: initialDetails.skills || [],
        location: initialDetails.location || '',
      });
    }
  }, [isOpen, initialDetails]);

  const handleSearch = () => {
    // Ensure we have some criteria to search with
    if (details.title || (details.skills && details.skills.length > 0) || details.location) {
      onSearch(details as JobPostDetails);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Find Candidates">
      <div className="space-y-6">
        <div>
          <label htmlFor="job-title" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Job Title</label>
          <input
            type="text"
            id="job-title"
            value={details.title}
            onChange={(e) => setDetails(d => ({...d, title: e.target.value}))}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="e.g., Senior React Developer"
          />
        </div>
        <TagInput
            label="Key Skills"
            tags={details.skills || []}
            setTags={skills => setDetails(d => ({...d, skills}))}
            placeholder="Add skill, press Enter"
        />
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Location</label>
          <input
            type="text"
            id="location"
            value={details.location}
            onChange={(e) => setDetails(d => ({...d, location: e.target.value}))}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSearching ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Searching...
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5"/>
                    Find Candidates
                </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FindCandidatesModal;