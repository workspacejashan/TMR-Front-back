import React, { useState, KeyboardEvent } from 'react';
import Modal from '../Modal';
import { CandidateProfile } from '../../types';
import { CloseIcon } from '../icons/Icons';
import ComboBox from '../ComboBox';

interface JobPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CandidateProfile;
  onSave: (profileData: Partial<CandidateProfile>) => Promise<void>;
}

const shiftOptions = [
    { value: 'Day Shift', label: 'Day Shift' },
    { value: 'Evening Shift', label: 'Evening Shift' },
    { value: 'Night Shift', label: 'Night Shift' },
    { value: 'Rotating Shifts', label: 'Rotating Shifts' },
    { value: 'Flexible Schedule', label: 'Flexible Schedule' },
];

const locationOptions = [
    { value: 'New York, NY', label: 'New York, NY' },
    { value: 'San Francisco, CA', label: 'San Francisco, CA' },
    { value: 'Chicago, IL', label: 'Chicago, IL' },
    { value: 'Austin, TX', label: 'Austin, TX' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Other', label: 'Other (specify with recruiter)' },
];

const payOptions = [
    { value: '$50 - $75 / hour', label: '$50 - $75 / hour' },
    { value: '$75 - $100 / hour', label: '$75 - $100 / hour' },
    { value: '$100 - $125 / hour', label: '$100 - $125 / hour' },
    { value: '$125+ / hour', label: '$125+ / hour' },
    { value: '$100k - $125k / year', label: '$100k - $125k / year' },
    { value: '$125k - $150k / year', label: '$125k - $150k / year' },
    { value: '$150k - $200k / year', label: '$150k - $200k / year' },
    { value: '$200k+ / year', label: '$200k+ / year' },
];


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

const JobPreferencesModal: React.FC<JobPreferencesModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
  const [prefs, setPrefs] = useState({
      roles: currentUser.roles || [],
      shift: currentUser.shift || '',
      location: currentUser.location || '',
      pay_expectations: currentUser.pay_expectations || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(prefs);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Job Preferences">
      <div className="space-y-6">
        <TagInput
            label="Preferred Role(s)"
            tags={prefs.roles}
            setTags={roles => setPrefs(p => ({...p, roles}))}
            placeholder="Add role, press Enter"
        />
        <ComboBox
            label="Preferred Shift"
            value={prefs.shift}
            onChange={shift => setPrefs(p => ({...p, shift}))}
            options={shiftOptions}
            placeholder="e.g., Day Shift, Flexible"
        />
        <ComboBox
            label="Preferred Location"
            value={prefs.location}
            onChange={location => setPrefs(p => ({...p, location}))}
            options={locationOptions}
            placeholder="e.g., Remote, New York, NY"
        />
        <ComboBox
            label="Pay Expectations"
            value={prefs.pay_expectations}
            onChange={pay_expectations => setPrefs(p => ({...p, pay_expectations}))}
            options={payOptions}
            placeholder="e.g., $100 - $125 / hour"
        />
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default JobPreferencesModal;