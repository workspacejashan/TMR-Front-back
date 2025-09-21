import React, { Suspense, lazy } from 'react';
import ChatWindow from './components/ChatWindow';
import RecruiterDashboard from './components/RecruiterDashboard';
import { useChat } from './hooks/useChat';
import { ModalType, UserType } from './types';

const OnboardingModal = lazy(() => import('./components/modals/OnboardingModal'));
const DocumentUploadModal = lazy(() => import('./components/modals/DocumentUploadModal'));
const JobPreferencesModal = lazy(() => import('./components/modals/JobPreferencesModal'));
const SkillsAssessmentModal = lazy(() => import('./components/modals/SkillsAssessmentModal'));
const AvailabilityModal = lazy(() => import('./components/modals/AvailabilityModal'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const RecruiterRequestsModal = lazy(() => import('./components/modals/RecruiterRequestsModal'));
const SuggestedJobsModal = lazy(() => import('./components/modals/SuggestedJobsModal'));
const PublicProfileModal = lazy(() => import('./components/modals/PublicProfileModal'));
const RecruiterMessagesModal = lazy(() => import('./components/modals/RecruiterMessagesModal'));
const ConnectRequestModal = lazy(() => import('./components/modals/ConnectRequestModal'));
const CandidateMessagesModal = lazy(() => import('./components/modals/CandidateMessagesModal'));
const JobDetailsModal = lazy(() => import('./components/modals/JobDetailsModal'));
const FindCandidatesModal = lazy(() => import('./components/modals/FindCandidatesModal'));

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
    jobSources,
    selectedJob,
    quickActions,
    jobPostDetails,
    sourcedCandidates,
    contactedCandidates,
    engagedCandidates,
    openModal,
    closeModal,
    openJobDetailsModal,
    closeJobDetailsModal,
    handleLoginAs,
    handleQuickActionClick,
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
                  onActionClick={handleAction}
                  onQuickActionClick={handleQuickActionClick}
                  onViewProfile={viewCandidateProfile}
                  quickActions={quickActions}
                  sourcedCandidates={sourcedCandidates}
                  contactedCandidates={contactedCandidates}
                  engagedCandidates={engagedCandidates}
                />;
      case UserType.CANDIDATE:
        return <ChatWindow
                messages={messages}
                isLoading={isLoading}
                onQuickActionClick={handleQuickActionClick}
                onActionClick={handleAction}
                quickActions={quickActions}
              />;
      case UserType.GUEST:
      default:
        // Auth modal is shown via activeModal state, so we can render an empty div here
        return <div className="h-full w-full bg-background dark:bg-dark-background"></div>;
    }
  };

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
        
        <Suspense fallback={null}>
          <AuthModal
            isOpen={activeModal === ModalType.AUTH}
            onLoginAs={handleLoginAs}
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
            sources={jobSources}
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
        </Suspense>
      </div>
    </>
  );
}

export default App;