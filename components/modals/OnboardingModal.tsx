import React, { useState, useRef, ChangeEvent } from 'react';
import Modal from '../Modal';
import { CandidateProfile } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CandidateProfile;
  onSave: (profileData: Partial<CandidateProfile>) => Promise<void>;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, currentUser, onSave }) => {
  const [name, setName] = useState(currentUser.name || '');
  const [title, setTitle] = useState(currentUser.title || '');
  const [photo, setPhoto] = useState<string | null>(currentUser.profile_photo_url);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      // Simulate upload delay and use a local blob URL for preview
      await new Promise(res => setTimeout(res, 1000));
      const localUrl = URL.createObjectURL(file);
      setPhoto(localUrl);
      setIsUploading(false);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ name, title, profile_photo_url: photo });
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Setup Your Profile">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group w-32 h-32">
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-dark-border flex items-center justify-center overflow-hidden cursor-pointer ring-4 ring-slate-200 dark:ring-slate-700" onClick={() => !isUploading && fileInputRef.current?.click()}>
                    {isUploading ? (
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    ) : photo ? (
                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-400 text-5xl"><i className="fa fa-user"></i></span>
                    )}
                </div>
                 <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                    <span className="text-white text-sm font-semibold">Change Photo</span>
                 </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" disabled={isUploading} />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="e.g., Dr. Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Professional Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="e.g., Registered Nurse"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;