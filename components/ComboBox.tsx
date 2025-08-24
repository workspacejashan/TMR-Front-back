import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { ChevronUpDownIcon } from './icons/Icons';

export interface ComboBoxOption {
  value: string;
  label: string;
}

interface ComboBoxProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

const ComboBox = ({
  options,
  value,
  onChange,
  placeholder = "Select or type...",
  label,
}: ComboBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = value
    ? options.filter(option =>
        option.label.toLowerCase().includes(value.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">{label}</label>
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-background dark:bg-dark-surface py-2.5 pl-3 pr-10 text-left border border-border dark:border-dark-border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary transition text-sm text-text-primary dark:text-dark-text-primary"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                    aria-label="Toggle options"
                >
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface dark:bg-dark-surface py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-select-pop-in">
                {filteredOptions.map((option) => (
                <li
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className="relative cursor-pointer select-none py-2 pl-4 pr-4 text-text-primary dark:text-dark-text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                >
                    <span className="block truncate font-normal">
                      {option.label}
                    </span>
                </li>
                ))}
                {filteredOptions.length === 0 && value && (
                    <li className="relative cursor-default select-none py-2 px-4 text-sm text-text-secondary dark:text-dark-text-secondary">
                        No matching options.
                    </li>
                )}
            </ul>
            )}
        </div>
    </div>
  );
};

export default ComboBox;
