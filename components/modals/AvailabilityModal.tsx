import React, { useState } from 'react';
import Modal from '../Modal';
import { CandidateProfile } from '../../types';
import { PhoneIcon, ChatBubbleLeftEllipsisIcon } from '../icons/Icons';
import CustomSelect from '../CustomSelect';
import ComboBox from '../ComboBox';


interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CandidateProfile;
  onSave: (profileData: Partial<CandidateProfile>) => Promise<void>;
}

const timezones = [
    "Etc/GMT+12", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York", "America/Sao_Paulo", "Atlantic/Azores", "Europe/London", "Europe/Paris", "Europe/Moscow", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland"
];

const timezoneOptions = timezones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));

const workingHoursOptions = [
    { value: '9:00 AM - 5:00 PM (Mon-Fri)', label: '9:00 AM - 5:00 PM (Mon-Fri)' },
    { value: '8:00 AM - 4:00 PM (Mon-Fri)', label: '8:00 AM - 4:00 PM (Mon-Fri)' },
    { value: '10:00 AM - 6:00 PM (Mon-Fri)', label: '10:00 AM - 6:00 PM (Mon-Fri)' },
    { value: 'Flexible Schedule', label: 'Flexible Schedule' },
    { value: 'Part-Time (Specify with recruiter)', label: 'Part-Time (Specify with recruiter)' },
    { value: 'Evenings', label: 'Evenings' },
    { value: 'Nights', label: 'Nights' },
    { value: 'Weekends Only', label: 'Weekends Only' },
];

const callAvailableHoursOptions = [
    { value: 'Anytime during working hours', label: 'Anytime during working hours' },
    { value: 'Lunch Break (12pm - 1pm)', label: 'Lunch Break (12pm - 1pm)' },
    { value: 'Mornings (9am - 12pm)', label: 'Mornings (9am - 12pm)' },
    { value: 'Afternoons (1pm - 5pm)', label: 'Afternoons (1pm - 5pm)' },
    { value: 'After Work (5pm - 7pm)', label: 'After Work (5pm - 7pm)' },
    { value: 'By Appointment Only', label: 'By Appointment Only' },
];

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
  const [localAvailability, setLocalAvailability] = useState({
      contact_methods: currentUser.contact_methods || [],
      time_zone: currentUser.time_zone || '',
      working_hours: currentUser.working_hours || '',
      call_available_hours: currentUser.call_available_hours || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localAvailability);
    setIsSaving(false);
    onClose();
  };
  
  const handleContactMethodChange = (method: 'call' | 'text') => {
    const currentMethods = localAvailability.contact_methods;
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    setLocalAvailability(prev => ({...prev, contact_methods: newMethods}));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Your Availability">
      <div className="space-y-6">
         <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Contact Preferences</label>
            <div className="grid grid-cols-2 gap-3">
                {( [['call', 'Call', PhoneIcon], ['text', 'Text', ChatBubbleLeftEllipsisIcon]] as const ).map(([method, label, Icon]) => (
                    <button
                        key={method}
                        onClick={() => handleContactMethodChange(method)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                            localAvailability.contact_methods.includes(method)
                                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light shadow-inner'
                                : 'border-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Time Zone</label>
            <CustomSelect
                value={localAvailability.time_zone}
                onChange={tz => setLocalAvailability(prev => ({...prev, time_zone: tz}))}
                options={timezoneOptions}
                placeholder="Select your timezone"
            />
        </div>
        <ComboBox
            label="Working Hours"
            value={localAvailability.working_hours}
            onChange={working_hours => setLocalAvailability(prev => ({...prev, working_hours}))}
            options={workingHoursOptions}
            placeholder="e.g., 9am-5pm Mon-Fri"
        />
         <ComboBox
            label="Call Available Hours"
            value={localAvailability.call_available_hours}
            onChange={call_available_hours => setLocalAvailability(prev => ({...prev, call_available_hours}))}
            options={callAvailableHoursOptions}
            placeholder="e.g., After work (5pm-7pm)"
        />
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none"
          >
            {isSaving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AvailabilityModal;