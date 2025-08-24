import React, { useState } from 'react';
import Modal from '../Modal';
import { BotIcon, GoogleIcon, ArrowLeftIcon, BriefcaseIcon } from '../icons/Icons';
import { UserType } from '../../types';
import { AuthError } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (email: string, password: string) => Promise<AuthError | null>;
  onSignUp: (email: string, password: string, userType: UserType) => Promise<AuthError | null>;
  error: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin, onSignUp, error }) => {
  const [view, setView] = useState<'initial' | 'login' | 'signup'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<UserType>(UserType.CANDIDATE);
  const [isLoading, setIsLoading] = useState(false);


  const handleNoOp = () => {};

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };
  
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSignUp(email, password, selectedUserType);
    setIsLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setIsLoading(false);
  };

  const changeView = (newView: 'initial' | 'login' | 'signup') => {
    resetForm();
    setView(newView);
  };
  
  const getTitle = () => {
    switch(view) {
        case 'login': return 'Welcome Back';
        case 'signup': return 'Create Your Account';
        default: return 'Welcome!';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleNoOp} title={getTitle()} showCloseButton={false}>
        <div className="relative">
            {view !== 'initial' && (
                <button 
                    onClick={() => changeView('initial')} 
                    className="absolute -top-3 -left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
            )}

            {view === 'initial' && (
                <div className="text-center animate-fade-in-up py-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-full">
                            <BotIcon className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Your Personal AI Recruiter</h2>
                    <p className="mt-2 text-text-secondary dark:text-dark-text-secondary">
                    I'm here to manage your job search, so you don't have to.
                    </p>
                    <div className="mt-8 space-y-4">
                    <button
                        onClick={() => changeView('signup')}
                        className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => changeView('login')}
                        className="w-full bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                        Login
                    </button>
                    </div>
                </div>
            )}
            
            {(view === 'login' || view === 'signup') && error && (
                <div className="bg-red-100 dark:bg-red-500/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg mb-4 text-sm" role="alert">
                    <p>{error}</p>
                </div>
            )}
            
            {view === 'login' && (
                <div className="space-y-6 animate-fade-in-up">
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Email</label>
                            <input type="email" id="login-email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Password</label>
                            <input type="password" id="login-password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none">
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-text-secondary dark:text-dark-text-secondary">
                        Don't have an account? <button onClick={() => changeView('signup')} className="font-semibold text-primary hover:text-primary-light">Sign Up</button>
                    </p>
                </div>
            )}
            
            {view === 'signup' && (
                 <div className="space-y-6 animate-fade-in-up">
                    <form onSubmit={handleSignUpSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserType(UserType.CANDIDATE)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                                        selectedUserType === UserType.CANDIDATE
                                            ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light shadow-inner'
                                            : 'border-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-slate-400 dark:hover:border-slate-500'
                                    }`}
                                >
                                    <i className="fa fa-user text-2xl"></i>
                                    <span>Candidate</span>
                                </button>
                                 <button
                                    type="button"
                                    onClick={() => setSelectedUserType(UserType.RECRUITER)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                                        selectedUserType === UserType.RECRUITER
                                            ? 'border-secondary bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary/80 shadow-inner'
                                            : 'border-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-slate-400 dark:hover:border-slate-500'
                                    }`}
                                >
                                    <BriefcaseIcon className="w-8 h-8"/>
                                    <span>Recruiter</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Email</label>
                            <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Password</label>
                            <input type="password" id="signup-password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition" placeholder="Create a password" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-slate-400 disabled:transform-none disabled:shadow-none">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-text-secondary dark:text-dark-text-secondary">
                        Already have an account? <button onClick={() => changeView('login')} className="font-semibold text-primary hover:text-primary-light">Login</button>
                    </p>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default AuthModal;