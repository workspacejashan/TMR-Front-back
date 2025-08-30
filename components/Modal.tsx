import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { CloseIcon } from './icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-4xl';
  showCloseButton?: boolean;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md', showCloseButton = true, contentClassName = 'p-6' }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    // Only run animation when closing the modal
    if (prevIsOpen.current && !isOpen) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsAnimatingOut(false);
      }, 350); // Match animation duration
      return () => clearTimeout(timer);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);


  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${isOpen ? 'modal-enter' : 'modal-exit'}`}
      onClick={onClose}
    >
      <div
        className={`bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full ${maxWidth} m-auto transform transition-all duration-300 flex flex-col max-h-[90vh] ${isOpen ? 'modal-content-enter' : 'modal-content-exit'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex justify-between items-center border-b border-border dark:border-dark-border flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">{title}</h2>
          {showCloseButton && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <CloseIcon className="w-5 h-5"/>
            </button>
          )}
        </div>
        <div className={`min-h-0 flex-grow ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;