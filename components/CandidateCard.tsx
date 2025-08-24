import React from 'react';
import { CandidateProfile } from '../types';
import { MapPinIcon, SparklesIcon } from './icons/Icons';

interface CandidateCardProps {
    candidate: CandidateProfile;
    onViewProfile: (candidate: CandidateProfile) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onViewProfile }) => {
    return (
        <div className="bg-surface dark:bg-dark-surface p-5 rounded-xl border border-border dark:border-dark-border animate-fade-in-up transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02]">
            <div className="flex items-start gap-4">
                <img src={candidate.profile_photo_url || ''} alt={candidate.name || ''} className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" />
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{candidate.name}</h3>
                    <p className="text-primary dark:text-primary-light font-medium text-sm">{candidate.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-dark-text-secondary">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>{candidate.location}</span>
                    </div>
                </div>
                <button onClick={() => onViewProfile(candidate)} className="bg-primary-gradient text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-md">
                    View Profile
                </button>
            </div>
            <div className="mt-4 border-t border-border dark:border-dark-border pt-3">
                 <h4 className="text-xs font-semibold uppercase text-text-secondary dark:text-dark-text-secondary tracking-wider flex items-center gap-2 mb-2"><SparklesIcon className="w-4 h-4" /> Top Skills</h4>
                 <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 4).map(skill => (
                        <span key={skill.name} className="bg-slate-100 dark:bg-dark-border text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">{skill.name}</span>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default CandidateCard;