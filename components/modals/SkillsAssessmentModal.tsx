import React, { useState } from 'react';
import Modal from '../Modal';
import { Skill } from '../../types';
import { TrashIcon } from '../icons/Icons';

interface SkillsAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onSave: (skills: Skill[]) => Promise<void>;
}

const SkillsAssessmentModal: React.FC<SkillsAssessmentModalProps> = ({ isOpen, onClose, skills, onSave }) => {
  const [localSkills, setLocalSkills] = useState(skills);
  const [currentSkillName, setCurrentSkillName] = useState('');
  const [currentSkillLevel, setCurrentSkillLevel] = useState<1 | 2 | 3 | 4>(1);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = () => {
      if (currentSkillName.trim() && !localSkills.some(s => s.name.toLowerCase() === currentSkillName.trim().toLowerCase())) {
          setLocalSkills([...localSkills, { name: currentSkillName.trim(), level: currentSkillLevel }]);
          setCurrentSkillName('');
          setCurrentSkillLevel(1);
      }
  };

  const removeSkill = (skillName: string) => {
      setLocalSkills(localSkills.filter(s => s.name !== skillName));
  };
  
  const handleSave = async () => {
      setIsSaving(true);
      await onSave(localSkills);
      setIsSaving(false);
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Your Skills">
      <div className="space-y-6">
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 -mr-3">
            {localSkills.map((skill) => (
                <div key={skill.name} className="bg-background dark:bg-dark-surface p-3 rounded-lg flex items-center justify-between animate-fade-in-up border border-border dark:border-dark-border">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">{skill.name}</p>
                        <div className="flex items-center">
                            {[1,2,3,4].map(star => (
                                <span key={star} className={`text-xl cursor-default ${star <= skill.level ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>&#9733;</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => removeSkill(skill.name)} className="p-1.5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Remove Skill">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
            {localSkills.length === 0 && <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary py-4">No skills added yet. Use the form below to add one.</p>}
        </div>

        <div className="p-4 border-t border-border dark:border-dark-border space-y-4 -mx-6 -mb-6 rounded-b-2xl bg-slate-50 dark:bg-dark-surface/50">
            <h3 className="text-base font-semibold text-text-primary dark:text-dark-text-primary">Add a new skill</h3>
             <div>
                <label htmlFor="skill-name" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Skill Name</label>
                <input
                    type="text"
                    id="skill-name"
                    value={currentSkillName}
                    onChange={(e) => setCurrentSkillName(e.target.value)}
                    className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-dark-surface/50 focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
                    placeholder="e.g., IV Insertion"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Self-Assessment</label>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Rate your proficiency from 1 (Novice) to 4 (Expert).</p>
                <div className="mt-2 flex items-center space-x-2">
                    {[1, 2, 3, 4].map(level => (
                        <button key={level} onClick={() => setCurrentSkillLevel(level as 1|2|3|4)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all transform hover:scale-110 ${currentSkillLevel === level ? 'bg-primary-gradient text-white scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={handleAddSkill} disabled={!currentSkillName.trim()} className="w-full bg-secondary hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-secondary/50 transition-all duration-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-md">
                Add Skill
            </button>
        </div>
        
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:transform-none disabled:shadow-none"
          >
            {isSaving ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillsAssessmentModal;