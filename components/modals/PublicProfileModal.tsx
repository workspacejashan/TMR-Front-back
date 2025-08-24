import React, { useState, ReactNode } from 'react';
import { CandidateProfile, ModalType } from '../../types';
import { 
    BriefcaseIcon, SparklesIcon, ClockIcon, FileIcon, ShareIcon, CheckIcon, 
    MapPinIcon, CalendarDaysIcon, CurrencyDollarIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon,
    GlobeAltIcon, EyeIcon, LockClosedIcon, ChatBubbleLeftRightIcon
} from '../icons/Icons';
import Modal from '../Modal';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  openModal: (modalType: ModalType) => void;
  openConnectModal: (candidate: CandidateProfile) => void;
  isRecruiterView?: boolean;
}

const DetailItem: React.FC<{icon: ReactNode; label?: string; children: ReactNode; className?: string}> = ({icon, label, children, className}) => (
    <div className={`flex items-start gap-3 text-sm ${className}`}>
        <div className="text-slate-400 dark:text-slate-500 mt-0.5 w-5 h-5 flex items-center justify-center">{icon}</div>
        <div className="flex-1">
            {label && <span className="font-semibold text-text-primary dark:text-dark-text-primary">{label}: </span>}
            <span className="text-text-secondary dark:text-dark-text-secondary">{children}</span>
        </div>
    </div>
);

const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ isOpen, onClose, candidateProfile, openModal, openConnectModal, isRecruiterView = false }) => {
    const [copied, setCopied] = useState(false);
    
    if (!candidateProfile) return null;

    const { name, title, profile_photo_url, location, contact_methods, roles, shift, pay_expectations, time_zone, working_hours, skills, documents } = candidateProfile;

    const publicDocs = documents.filter(doc => doc.visibility === 'public');
    const gatedDocs = documents.filter(doc => doc.visibility === 'gated');
    const profileLink = `https://thatsmyrecruiter.com/p/${name?.toLowerCase().replace(/\s/g, '-') || 'your-name'}`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(profileLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleConnect = () => {
        openConnectModal(candidateProfile);
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase();
        if (type.includes('pdf')) return <i className="fa-solid fa-file-pdf text-red-500 text-2xl w-8 text-center"></i>;
        if (['jpg', 'jpeg', 'png'].includes(type)) return <i className="fa-solid fa-file-image text-sky-500 text-2xl w-8 text-center"></i>;
        return <FileIcon className="text-slate-500 w-6 h-6" />;
    };
    
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isRecruiterView ? `Candidate Profile` : 'Your Public Profile'}
            maxWidth="max-w-4xl"
            contentClassName="p-0 flex flex-col"
        >
            <div className="overflow-y-auto p-6 flex-grow">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* Left Sidebar */}
                    <aside className="w-full md:w-1/3 lg:w-1/4">
                        <div className="space-y-6 text-center md:text-left">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-dark-surface shadow-md">
                                    {profile_photo_url ? (
                                        <img src={profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-400 text-6xl"><i className="fa fa-user"></i></span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mt-4">{name || 'Your Name'}</h1>
                                <p className="text-md text-primary dark:text-primary-light font-medium">{title || 'Your Professional Title'}</p>
                            </div>
                            <div className="space-y-3">
                                <DetailItem icon={<MapPinIcon className="w-4 h-4"/>}>{location || <span className="italic text-slate-400">Not specified</span>}</DetailItem>
                                <DetailItem icon={<div className="w-4 flex justify-center">{contact_methods?.map(m => m === 'call' ? <PhoneIcon key="c" className="w-4 h-4 mr-1"/> : <ChatBubbleLeftEllipsisIcon key="t" className="w-4 h-4"/>)}</div>}>
                                    {contact_methods?.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' & ') || <span className="italic text-slate-400">Not specified</span>}
                                </DetailItem>
                            </div>
                            {!isRecruiterView && (
                            <div>
                                <label className="text-xs font-semibold uppercase text-text-secondary dark:text-dark-text-secondary tracking-wider">Shareable Link</label>
                                <div className="relative mt-2">
                                    <input type="text" value={profileLink} readOnly className="w-full bg-background dark:bg-dark-border border border-border dark:border-dark-border/50 rounded-lg pl-3 pr-24 py-2 text-xs text-text-secondary dark:text-dark-text-secondary focus:outline-none"/>
                                    <button onClick={handleCopy} className={`absolute right-1 top-1 flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1.5 rounded-md transition-all duration-200 ${copied ? 'bg-green-500 text-white' : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-text-primary dark:text-dark-text-primary'}`}>
                                        {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ShareIcon className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="w-full md:w-2/3 lg:w-3/4 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3 mb-4"><BriefcaseIcon className="text-primary w-6 h-6"/> Job Preferences</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                                    <DetailItem icon={<i className="fa-solid fa-user-doctor w-4 text-center"></i>} label="Preferred Role(s)">
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                        {(roles && roles.length > 0) ? roles.map(role => (
                                            <span key={role} className="bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light text-xs font-medium px-2.5 py-1 rounded-full">{role}</span>
                                        )) : <span className="italic text-slate-400">Not specified</span>}
                                        </div>
                                    </DetailItem>
                                </div>
                                <div className="bg-slate-50 dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border space-y-3">
                                    <DetailItem icon={<CalendarDaysIcon className="w-4 h-4"/>} label="Shift">{shift || <span className="italic text-slate-400">Not specified</span>}</DetailItem>
                                    <DetailItem icon={<CurrencyDollarIcon className="w-4 h-4"/>} label="Pay">{pay_expectations || <span className="italic text-slate-400">Not specified</span>}</DetailItem>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3 mb-4"><SparklesIcon className="text-primary w-6 h-6"/> Top Skills</h2>
                            <div className="bg-slate-50 dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
                                {skills.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                        {skills.map(skill => (
                                            <li key={skill.name} className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-text-primary dark:text-dark-text-primary">{skill.name}</span>
                                                <div className="flex items-center">
                                                    {[1,2,3,4].map(star => (
                                                        <span key={star} className={`text-xl ${star <= skill.level ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>&#9733;</span>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4 italic">No skills have been added yet.</p>}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3 mb-4"><ClockIcon className="text-primary w-6 h-6"/> Availability</h2>
                            <div className="bg-slate-50 dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailItem icon={<GlobeAltIcon className="w-4 h-4"/>} label="Time Zone">{time_zone || <span className="italic text-slate-400">Not specified</span>}</DetailItem>
                                    <DetailItem icon={<ClockIcon className="w-4 h-4"/>} label="Working Hours">{working_hours || <span className="italic text-slate-400">Not specified</span>}</DetailItem>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary flex items-center gap-3 mb-4"><FileIcon className="text-primary w-6 h-6"/> Documents</h2>
                            <div className="space-y-3">
                                {publicDocs.length > 0 && publicDocs.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 dark:bg-dark-surface p-3 rounded-xl border border-border dark:border-dark-border hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            {getFileIcon(doc.type)}
                                            <div>
                                                <p className="font-medium text-sm text-text-primary dark:text-dark-text-primary">{doc.name}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Public Document</p>
                                            </div>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-text-primary dark:text-dark-text-primary text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors" title="View">
                                            <EyeIcon className="w-4 h-4" />
                                            <span>View</span>
                                        </a>
                                    </div>
                                ))}
                                {gatedDocs.length > 0 && gatedDocs.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 dark:bg-dark-surface p-3 rounded-xl border border-border dark:border-dark-border hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            {getFileIcon(doc.type)}
                                            <div>
                                                <p className="font-medium text-sm text-text-primary dark:text-dark-text-primary">{doc.name}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center gap-1"><LockClosedIcon className="w-3 h-3"/> Gated Document</p>
                                            </div>
                                        </div>
                                        {isRecruiterView ? (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-text-primary dark:text-dark-text-primary text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors" title="View">
                                                <EyeIcon className="w-4 h-4" />
                                                <span>View</span>
                                            </a>
                                        ) : (
                                            <button onClick={() => openModal(ModalType.AUTH)} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary-dark dark:text-primary-light text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors" title="Unlock to View">
                                                <LockClosedIcon className="w-4 h-4" />
                                                <span>Unlock</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {documents.length === 0 && <div className="bg-slate-50 dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border"><p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4 italic">No documents available.</p></div>}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
            {(isRecruiterView && name) && (
                <div className="p-6 border-t border-border dark:border-dark-border flex justify-end gap-3 flex-shrink-0 bg-slate-50/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
                    >
                        Close
                    </button>
                     <button
                        onClick={handleConnect}
                        className="bg-primary-gradient text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                        Connect with {name.split(' ')[0]}
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default PublicProfileModal;