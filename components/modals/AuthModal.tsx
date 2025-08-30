import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { BotIcon, BriefcaseIcon, ArrowLeftIcon } from '../icons/Icons';
import { UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onLoginAs: (userType: UserType, isGettingStarted?: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginAs }) => {
  const [view, setView] = useState<'initial' | 'getStarted' | 'login'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setView('initial');
      setEmail('');
      setPassword('');
      setError('');
      setSelectedRole(null);
    }
  }, [isOpen]);
  
  const handleNoOp = () => {};

  const handleLogin = () => {
    setError('');
    // Mock login logic for the demo
    if (email.toLowerCase() === 'alex.doe@example.com') {
      onLoginAs(UserType.CANDIDATE, false);
    } else if (email.toLowerCase() === 'recruiter@example.com') {
      onLoginAs(UserType.RECRUITER, false);
    } else {
      setError('Invalid credentials. Use "alex.doe@example.com" (candidate) or "recruiter@example.com" (recruiter).');
    }
  };
  
  const handleGetStarted = () => {
    if (email && password && selectedRole) {
      onLoginAs(selectedRole, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, action: 'login' | 'getStarted') => {
    if (e.key === 'Enter') {
      if (action === 'login') {
        handleLogin();
      } else if (action === 'getStarted' && email && password && selectedRole) {
        handleGetStarted();
      }
    }
  };
  
  const renderInitialView = () => (
    <div className="text-center animate-fade-in-up py-4">
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-full">
                <BotIcon className="w-10 h-10 text-primary" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Your Personal AI Recruiter</h2>
        <p className="mt-2 text-text-secondary dark:text-dark-text-secondary">
          The all-in-one platform to manage your career or find top talent.
        </p>
        <div className="mt-8 space-y-4">
            <button
                onClick={() => setView('getStarted')}
                className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
            >
                Get Started
            </button>
            <button
                onClick={() => setView('login')}
                className="w-full bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all duration-300"
            >
                Login
            </button>
        </div>
    </div>
  );

  const renderGetStartedView = () => (
    <div className="animate-fade-in-up py-4 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="get-started-email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Email Address</label>
          <input
            type="email"
            id="get-started-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'getStarted')}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label htmlFor="get-started-password" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Password</label>
          <input
            type="password"
            id="get-started-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'getStarted')}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="Create a password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Select your role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedRole(UserType.CANDIDATE)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                selectedRole === UserType.CANDIDATE
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light shadow-inner'
                    : 'border-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <i className="fa fa-user"></i>
              <span>Candidate</span>
            </button>
            <button
              onClick={() => setSelectedRole(UserType.RECRUITER)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                selectedRole === UserType.RECRUITER
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light shadow-inner'
                    : 'border-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <BriefcaseIcon className="w-5 h-5"/>
              <span>Recruiter</span>
            </button>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <button
          onClick={handleGetStarted}
          disabled={!email || !password || !selectedRole}
          className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed"
        >
          Create Account
        </button>
      </div>
    </div>
  );

  const renderLoginView = () => (
     <div className="animate-fade-in-up py-4 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'login')}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="alex.doe@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1.5">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'login')}
            className="block w-full bg-background dark:bg-dark-surface border-border dark:border-dark-border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-dark-surface focus:ring-primary focus:border-primary sm:text-sm p-3 transition"
            placeholder="Password (any)"
          />
        </div>
        {error && <p className="text-red-500 text-xs text-center pt-1">{error}</p>}
      </div>
       <div className="pt-2">
            <button
                onClick={handleLogin}
                className="w-full bg-primary-gradient text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
            >
                Login
            </button>
        </div>
    </div>
  );

  const getTitle = () => {
    switch(view) {
      case 'getStarted': return 'Join the Network';
      case 'login': return 'Welcome Back!';
      case 'initial':
      default: return 'Welcome to ThatsMyRecruiter';
    }
  };

  const handleBack = () => {
    setView('initial');
    setError('');
    setEmail('');
    setPassword('');
    setSelectedRole(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleNoOp} title={getTitle()} showCloseButton={false}>
       <div className="relative">
            {view !== 'initial' && (
                <button onClick={handleBack} className="absolute -top-4 -left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 z-10">
                    <ArrowLeftIcon className="w-5 h-5"/>
                </button>
            )}
            {view === 'initial' && renderInitialView()}
            {view === 'getStarted' && renderGetStartedView()}
            {view === 'login' && renderLoginView()}
        </div>
    </Modal>
  );
};

export default AuthModal;