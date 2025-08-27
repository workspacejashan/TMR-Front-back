import React from 'react';
import ChatWindow from './components/ChatWindow';
import OnboardingModal from './components/modals/OnboardingModal';
import DocumentUploadModal from './components/modals/DocumentUploadModal';
import JobPreferencesModal from './components/modals/JobPreferencesModal';
import SkillsAssessmentModal from './components/modals/SkillsAssessmentModal';
import AvailabilityModal from './components/modals/AvailabilityModal';
import AuthModal from './components/modals/AuthModal';
import RecruiterRequestsModal from './components/modals/RecruiterRequestsModal';
import SuggestedJobsModal from './components/modals/SuggestedJobsModal';
import PublicProfileModal from './components/modals/PublicProfileModal';
import RecruiterDashboard from './components/RecruiterDashboard';
import RecruiterMessagesModal from './components/modals/RecruiterMessagesModal';
import ConnectRequestModal from './components/modals/ConnectRequestModal';
import CandidateMessagesModal from './components/modals/CandidateMessagesModal';
import JobDetailsModal from './components/modals/JobDetailsModal';
import FindCandidatesModal from './components/modals/FindCandidatesModal';
import { useChat } from './hooks/useChat';
import { ModalType, UserType } from './types';

function App() {
  const {
    messages,
    recruiterMessages,
    isLoading,
    isJobsLoading,
    isFindingCandidates,
    activeModal,
    userType,
    currentUser,
    foundCandidates,
    selectedCandidate,
    candidateToConnect,
    conversations,
    suggestedJobs,
    selectedJob,
    quickActions,
    authError,
    jobPostDetails,
    sendMessage,
    openModal,
    closeModal,
    openJobDetailsModal,
    closeJobDetailsModal,
    handleSignUp,
    handleLogin,
    handleAction,
    updateProfile,
    updateSkills,
    uploadFile,
    deleteFile,
    updateFileVisibility,
    viewCandidateProfile,
    closeCandidateProfile,
    sendChatMessage,
    sendCandidateMessage,
    openConnectModal,
    closeConnectModal,
    sendConnectionRequest,
    approveConversation,
    denyConversation,
    findCandidates,
  } = useChat();

  const renderContent = () => {
    switch (userType) {
      case UserType.RECRUITER:
        return <RecruiterDashboard 
                  messages={recruiterMessages}
                  isLoading={isLoading}
                  sendMessage={sendMessage}
                  onActionClick={handleAction}
                  onViewProfile={viewCandidateProfile}
                  quickActions={quickActions}
                  foundCandidates={foundCandidates}
                />;
      case UserType.CANDIDATE:
        return <ChatWindow
                messages={messages}
                isLoading={isLoading}
                sendMessage={sendMessage}
                onActionClick={handleAction}
                quickActions={quickActions}
              />;
      case UserType.GUEST:
      default:
        // Auth modal is shown via activeModal state, so we can render an empty div here
        return <div className="h-full w-full bg-background dark:bg-dark-background"></div>;
    }
  };
  
  // Display a full-screen loading spinner during the initial session/profile fetch.
  // This prevents any UI flicker before the app knows what state to render.
  if (isLoading && !currentUser && activeModal !== ModalType.AUTH) {
    return (
      <div className="h-[100dvh] w-screen bg-background dark:bg-dark-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }
        
        @keyframes breathing {
          0%, 100% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1); opacity: 1; }
        }
        .animate-breathing {
          animation: breathing 1.5s infinite ease-in-out;
        }

        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes modal-content-in {
            from { opacity: 0; transform: scale(0.92) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modal-content-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.92) translateY(10px); }
        }

        .modal-enter {
          animation: modal-fade-in 0.35s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }
        .modal-exit {
          animation: modal-fade-out 0.35s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }
        .modal-content-enter {
          animation: modal-content-in 0.35s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }
        .modal-content-exit {
          animation: modal-content-out 0.35s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }

        @keyframes select-pop-in {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-select-pop-in {
          animation: select-pop-in 0.2s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
          transform-origin: top;
        }
        
        @keyframes full-modal-content-in {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes full-modal-content-out {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.98); }
        }
        .full-modal-content-enter {
          animation: full-modal-content-in 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }
        .full-modal-content-exit {
          animation: full-modal-content-out 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
        }

        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="h-[100dvh] w-screen">
        {renderContent()}
        
        <AuthModal
          isOpen={activeModal === ModalType.AUTH}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          error={authError}
        />

        {currentUser && (
          <>
            <OnboardingModal 
              isOpen={activeModal === ModalType.ONBOARDING_PROFILE}
              onClose={closeModal}
              currentUser={currentUser}
              onSave={updateProfile}
            />
            <DocumentUploadModal
              isOpen={activeModal === ModalType.DOCUMENTS_UPLOAD}
              onClose={closeModal}
              documents={currentUser.documents}
              onUpload={uploadFile}
              onDelete={deleteFile}
              onSetVisibility={updateFileVisibility}
            />
            <JobPreferencesModal
              isOpen={activeModal === ModalType.JOB_PREFERENCES}
              onClose={closeModal}
              currentUser={currentUser}
              onSave={updateProfile}
            />
            <SkillsAssessmentModal
              isOpen={activeModal === ModalType.SKILLS_ASSESSMENT}
              onClose={closeModal}
              skills={currentUser.skills}
              onSave={updateSkills}
            />
            <AvailabilityModal
              isOpen={activeModal === ModalType.AVAILABILITY}
              onClose={closeModal}
              currentUser={currentUser}
              onSave={updateProfile}
            />
            <CandidateMessagesModal
              isOpen={activeModal === ModalType.CANDIDATE_MESSAGES}
              onClose={closeModal}
              conversations={conversations}
              onSendMessage={sendCandidateMessage}
            />
            <RecruiterRequestsModal
              isOpen={activeModal === ModalType.RECRUITER_REQUESTS}
              onClose={closeModal}
              requests={conversations}
              onApprove={approveConversation}
              onDeny={denyConversation}
            />
          </>
        )}

        <SuggestedJobsModal
          isOpen={activeModal === ModalType.SUGGESTED_JOBS}
          onClose={closeModal}
          jobs={suggestedJobs}
          isLoading={isJobsLoading}
          openJobDetailsModal={openJobDetailsModal}
        />

        <PublicProfileModal
          isOpen={activeModal === ModalType.PUBLIC_PROFILE && !!(currentUser || selectedCandidate)}
          onClose={userType === UserType.RECRUITER ? closeCandidateProfile : closeModal}
          candidateProfile={selectedCandidate ?? currentUser!}
          openModal={openModal}
          isRecruiterView={userType === UserType.RECRUITER}
          openConnectModal={openConnectModal}
        />

        <RecruiterMessagesModal
            isOpen={activeModal === ModalType.RECRUITER_MESSAGES}
            onClose={closeModal}
            conversations={conversations}
            onSendMessage={sendChatMessage}
        />

        {userType === UserType.RECRUITER && (
          <FindCandidatesModal
            isOpen={activeModal === ModalType.FIND_CANDIDATES_FLOW}
            onClose={closeModal}
            initialDetails={jobPostDetails}
            onSearch={findCandidates}
            isSearching={isFindingCandidates}
          />
        )}

        {candidateToConnect && (
            <ConnectRequestModal
                isOpen={!!candidateToConnect}
                onClose={closeConnectModal}
                candidate={candidateToConnect}
                onSend={(message) => sendConnectionRequest(candidateToConnect.id, message)}
            />
        )}
        
        <JobDetailsModal 
            isOpen={!!selectedJob}
            onClose={closeJobDetailsModal}
            job={selectedJob}
        />

      </div>
    </>
  );
}

export default App;