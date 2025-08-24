import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronUpDownIcon, CheckIcon } from './icons/Icons';

export interface SelectOption<T> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string | number> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  containerClassName?: string;
}

const CustomSelect = <T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  containerClassName = ""
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${containerClassName}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-pointer rounded-lg bg-background dark:bg-dark-surface py-2.5 pl-3 pr-10 text-left border border-border dark:border-dark-border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary transition"
      >
        <span className={`block truncate text-sm ${selectedOption ? 'text-text-primary dark:text-dark-text-primary' : 'text-text-secondary dark:text-dark-text-secondary'}`}>
          {selectedOption?.icon && <span className="mr-2 inline-flex align-middle">{selectedOption.icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface dark:bg-dark-surface py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-select-pop-in">
          {options.map((option) => (
            <li
              key={option.value.toString()}
              onClick={() => handleSelect(option.value)}
              className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-text-primary dark:text-dark-text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
            >
              <span className={`block truncate ${value === option.value ? 'font-semibold text-primary dark:text-primary-light' : 'font-normal'}`}>
                {option.icon && <span className="mr-2 inline-flex align-middle">{option.icon}</span>}
                {option.label}
              </span>
              {value === option.value ? (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary dark:text-primary-light">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;