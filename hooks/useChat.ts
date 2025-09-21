import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAuthor, ModalType, UserType, CandidateProfile, JobPostDetails, Conversation, Action, Skill, UploadedFile, DocumentVisibility, Job, JobSource } from '../types';
import { aiService } from '../services/geminiService';
import { jobSearchService } from '../services/jobSearchService';
import { mockCandidates } from '../data/mockCandidates'; // For recruiter search
import { mockConversations } from '../data/mockConversations';

// Mock data for the logged-in candidate user
const mockCandidateUser: CandidateProfile = {
    id: 'mock-user',
    user_type: UserType.CANDIDATE,
    email: 'alex.doe@example.com',
    name: 'Alex Doe',
    title: 'Registered Nurse',
    profile_photo_url: 'https://i.pravatar.cc/150?u=alex_doe',
    roles: ['Registered Nurse'],
    shift: 'Day Shift',
    location: 'Austin, TX',
    pay_expectations: '$75 - $100 / hour',
    contact_methods: ['call', 'text'],
    time_zone: 'America/Chicago',
    working_hours: '9:00 AM - 5:00 PM (Mon-Fri)',
    call_available_hours: 'After Work (5pm - 7pm)',
    skills: [
        { name: 'IV Insertion', level: 4 },
        { name: 'Patient Care', level: 3 },
    ],
    documents: [
        { 
            id: 'doc-mock-1', 
            name: 'Resume_AlexDoe.pdf', 
            size: 132000, 
            type: 'pdf', 
            visibility: 'public', 
            file_path: '/mock/resume.pdf',
            url: '#'
        },
    ]
};

const mockRecruiterUser = {
    id: 'mock-recruiter',
    user_type: UserType.RECRUITER,
    email: 'recruiter@example.com',
    name: 'Sam Jones',
    title: 'Talent Acquisition Specialist',
    profile_photo_url: 'https://i.pravatar.cc/150?u=sam_jones',
    skills: [],
    documents: [],
    roles: null, shift: null, location: null, pay_expectations: null, contact_methods: null, time_zone: null, working_hours: null, call_available_hours: null,
};


const candidateQuickActions: Action[] = [
    { label: "View Public Profile", type: 'open_modal', payload: { modalType: ModalType.PUBLIC_PROFILE } },
    { label: "Messages", type: 'open_modal', payload: { modalType: ModalType.CANDIDATE_MESSAGES } },
    { label: "Recruiter Requests", type: 'open_modal', payload: { modalType: ModalType.RECRUITER_REQUESTS } },
    { label: "Jobs", type: 'open_modal', payload: { modalType: ModalType.SUGGESTED_JOBS } },
    { label: "Documents", type: 'open_modal', payload: { modalType: ModalType.DOCUMENTS_UPLOAD } },
    { label: "Skills", type: 'open_modal', payload: { modalType: ModalType.SKILLS_ASSESSMENT } },
    { label: "Set Availability", type: 'open_modal', payload: { modalType: ModalType.AVAILABILITY } },
    { label: "Job Preferences", type: 'open_modal', payload: { modalType: ModalType.JOB_PREFERENCES } },
    { label: "Logout", type: 'logout' },
];

const recruiterQuickActions: Action[] = [
    { label: "Search for Candidates", type: 'start_flow', payload: { flowName: 'find_candidates' } },
    { label: "View Messages", type: 'open_modal', payload: { modalType: ModalType.RECRUITER_MESSAGES } },
    { label: "Logout", type: 'logout' },
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);
  const [quickActions, setQuickActions] = useState<Action[]>([]);
  
  // For Candidate user
  const [currentUser, setCurrentUser] = useState<CandidateProfile | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [jobSources, setJobSources] = useState<JobSource[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  
  // Shared conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // For Recruiter user
  const [recruiterMessages, setRecruiterMessages] = useState<Message[]>([]);
  const [foundCandidates, setFoundCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [candidateToConnect, setCandidateToConnect] = useState<CandidateProfile | null>(null);
  const [isFindingCandidates, setIsFindingCandidates] = useState(false);
  
  // Recruiter find candidates flow state
  const [jobPostDetails, setJobPostDetails] = useState<Partial<JobPostDetails>>({});
  
  // Recruiter pipeline state
  const [sourcedCandidates, setSourcedCandidates] = useState<CandidateProfile[]>([]);
  const [contactedCandidates, setContactedCandidates] = useState<CandidateProfile[]>([]);
  const [engagedCandidates, setEngagedCandidates] = useState<CandidateProfile[]>([]);

  const openJobDetailsModal = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const closeJobDetailsModal = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const addMessage = useCallback((author: MessageAuthor, text: string, actions: Action[] = [], target: 'candidate' | 'recruiter' = 'candidate') => {
    const newMessage: Message = { id: `${author}-${Date.now()}`, author, text, actions };
    if (target === 'recruiter') {
        setRecruiterMessages(prev => [...prev, newMessage]);
    } else {
        setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const handleOpenModal = useCallback((modalType: ModalType) => setActiveModal(modalType), []);
  const handleCloseModal = useCallback(() => setActiveModal(ModalType.NONE), []);

  const getSuggestedJobs = useCallback(async () => {
    if (!currentUser?.roles?.length) {
      console.warn("Attempted to get jobs without user roles defined.");
      return;
    }
    setIsJobsLoading(true);
    setSuggestedJobs([]);
    setJobSources([]);
    try {
      const { jobs, sources } = await jobSearchService.findJobs({
        roles: currentUser.roles,
        location: currentUser.location || '',
      });
      setSuggestedJobs(jobs);
      setJobSources(sources);
    } catch (error) {
      console.error("Failed to fetch suggested jobs:", error);
      // Set an error state for the jobs list to inform the user
      setSuggestedJobs([{
          id: 'error-1',
          title: 'Could Not Load Jobs',
          company: 'Error',
          location: 'N/A',
          description: 'There was an error while trying to fetch job suggestions. Please try again later.',
          applyUrl: '#'
      }]);
      setJobSources([]);
    } finally {
      // This ensures the loading spinner is turned off, regardless of success or failure.
      setIsJobsLoading(false);
    }
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
    setCurrentUser(null);
    setUserType(UserType.GUEST);
    setMessages([]);
    setRecruiterMessages([]);
    setActiveModal(ModalType.AUTH);
  }, []);

  const handleAction = useCallback((action: Action) => {
    if (action.type === 'open_modal' && action.payload?.modalType) {
      if (action.payload.modalType === ModalType.SUGGESTED_JOBS) {
        getSuggestedJobs();
      }
      handleOpenModal(action.payload.modalType);
    } else if (action.type === 'logout') {
        handleLogout();
    } else if (action.type === 'start_flow' && action.payload?.flowName === 'find_candidates') {
        setJobPostDetails({}); // Clear previous details
        setActiveModal(ModalType.FIND_CANDIDATES_FLOW);
    }
  }, [handleOpenModal, getSuggestedJobs, handleLogout]);
  
  const handleQuickActionClick = useCallback(async (action: Action) => {
    const isRecruiter = userType === UserType.RECRUITER;
    const target = isRecruiter ? 'recruiter' : 'candidate';

    if (action.type === 'logout') {
        handleLogout();
        return;
    }
    
    if (!action.label) return;

    // 1. Add user's action as a message to simulate conversation
    addMessage(MessageAuthor.USER, action.label, [], target);
    setIsLoading(true);
    
    // 2. Add bot's response after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (isRecruiter && (action.label === "Search for Candidates" || action.label === "View Messages")) {
        addMessage(MessageAuthor.BOT, "This feature is coming soon!", [], target);
        setIsLoading(false);
        return;
    }

    const responseMap: { [key: string]: string } = {
        "View Public Profile": "Of course. Here is your public profile.",
        "Messages": "Opening your messages.",
        "Recruiter Requests": "Here are the current requests from recruiters.",
        "Jobs": "Let's find some jobs that match your profile.",
        "Documents": "Opening your document manager.",
        "Skills": "Here are your skills. You can manage them here.",
        "Set Availability": "Let's set your availability preferences.",
        "Job Preferences": "Here are your job preferences.",
        "Search for Candidates": "Let's start a new search for candidates.",
        "View Messages": "Opening your messages.",
    };
    const botResponseText = responseMap[action.label] || `Opening ${action.label.toLowerCase()}...`;
    addMessage(MessageAuthor.BOT, botResponseText, [], target);
    
    // 3. Trigger the action (e.g., open modal) after another delay
    await new Promise(resolve => setTimeout(resolve, 900));
    handleAction(action);
    
    setIsLoading(false);
  }, [userType, addMessage, handleAction, setIsLoading, handleLogout]);

  const findCandidates = useCallback(async (details: JobPostDetails) => {
    setIsFindingCandidates(true);
    addMessage(MessageAuthor.BOT, `Searching for mock candidates matching your criteria...`, [], 'recruiter');
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 1500));

    const results = mockCandidates.filter(candidate => {
        const locationMatch = !details.location || candidate.location?.toLowerCase().includes(details.location.toLowerCase());
        const skillMatch = !details.skills || details.skills.length === 0 || details.skills.some(skill => 
            candidate.skills.some(cs => cs.name.toLowerCase().includes(skill.toLowerCase()))
        );
        return locationMatch && skillMatch;
    });

    setFoundCandidates(results);
    addMessage(MessageAuthor.BOT, `I've found ${results.length} candidate(s). You can view them in the Candidates panel.`, [], 'recruiter');
    
    setIsFindingCandidates(false);
    handleCloseModal();
  }, [addMessage, handleCloseModal]);
  
  const handleLoginAs = (type: UserType, isGettingStarted = false) => {
      setUserType(type);
      setActiveModal(ModalType.NONE);

      const target = type === UserType.RECRUITER ? 'recruiter' : 'candidate';
      const user = type === UserType.CANDIDATE ? mockCandidateUser : mockRecruiterUser;
      
      setCurrentUser(user as CandidateProfile);
      
      if (type === UserType.RECRUITER) {
        const recruiterMockConvos: Conversation[] = [{
            id: 'convo-rec-1',
            status: 'accepted',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            other_participant: {
                id: 'candidate-1', // Jane Doe
                name: 'Jane Doe',
                profile_photo_url: 'https://i.pravatar.cc/150?u=jane_doe',
            },
            messages: [
                { id: 'msg-rec-1', author: MessageAuthor.USER, text: "Hi Jane, found your profile and it looks like a great match for a Senior RN role. Interested?" },
                { id: 'msg-rec-2', author: MessageAuthor.PARTICIPANT, text: "Hi! Yes, I'm interested in learning more." }
            ],
            lastMessageAt: new Date(Date.now() - 86400000).toISOString()
        }];
        setConversations(recruiterMockConvos);
      } else {
        setConversations(mockConversations);
      }

      if (isGettingStarted) {
        if (type === UserType.CANDIDATE) {
          addMessage(MessageAuthor.BOT, `Welcome! Let's get your profile set up so recruiters can find you.`, [], target);
          // Add a small delay for the message to be read, then open the onboarding modal.
          setTimeout(() => {
              handleOpenModal(ModalType.ONBOARDING_PROFILE);
          }, 1200);
        } else { // Recruiter
           addMessage(MessageAuthor.BOT, `Welcome! Let's get you set up to find the best candidates.`, [], target);
           addMessage(MessageAuthor.BOT, `You can start by using the "Search for Candidates" action below.`, [], target);
        }
      } else { // Regular login
        addMessage(MessageAuthor.BOT, `Welcome back, ${user.name}! What can I help you with today?`, [], target);
      }
  };
  
  useEffect(() => {
    // On initial load, show the auth/selection modal.
    setActiveModal(ModalType.AUTH);
  }, []);
  
  const updateProfile = async (profileData: Partial<CandidateProfile>) => {
      if (!currentUser) return;
      setCurrentUser(prev => ({ ...prev!, ...profileData }));
  };
  
  const updateSkills = async (newSkills: Skill[]) => {
      if (!currentUser) return;
      setCurrentUser(prev => ({...prev!, skills: newSkills}));
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
      if (!currentUser) return null;
      const newDocument: UploadedFile = {
        id: `doc-mock-${Date.now()}`,
        user_id: currentUser.id,
        name: file.name,
        size: file.size,
        type: file.type.split('/')[1] || 'file',
        file_path: `mock/${file.name}`,
        visibility: 'private' as DocumentVisibility,
        url: URL.createObjectURL(file) // Create a temporary local URL for preview
      };
      setCurrentUser(prev => ({...prev!, documents: [...prev!.documents, newDocument]}));
      return newDocument;
  };
  
  const deleteFile = async (fileId: string) => {
      if (!currentUser) return;
      setCurrentUser(prev => ({...prev!, documents: prev!.documents.filter(d => d.id !== fileId)}));
  };
  
  const updateFileVisibility = async (fileId: string, visibility: DocumentVisibility) => {
    if (!currentUser) return;
    setCurrentUser(prev => ({...prev!, documents: prev!.documents.map(d => d.id === fileId ? {...d, visibility} : d)}));
  };
  
  // Dummy implementations for recruiter/messaging logic
  const sendChatMessage = (id:string, text:string) => console.log('sendChatMessage', id, text);
  const sendCandidateMessage = (id:string, text:string) => console.log('sendCandidateMessage', id, text);
  const viewCandidateProfile = (c: CandidateProfile) => setSelectedCandidate(c);
  const closeCandidateProfile = () => setSelectedCandidate(null);
  const openConnectModal = (c: CandidateProfile) => setCandidateToConnect(c);
  const closeConnectModal = () => setCandidateToConnect(null);
  
  const sendConnectionRequest = (candidateId: string, message: string) => {
    const candidate = mockCandidates.find(c => c.id === candidateId) || foundCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Prevent duplicate conversation
    if (conversations.some(c => c.other_participant.id === candidateId)) {
        addMessage(MessageAuthor.BOT, `You have already started a conversation with ${candidate.name}.`, [], 'recruiter');
        closeConnectModal();
        return;
    }

    const newConversation: Conversation = {
        id: `convo-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        other_participant: {
            id: candidate.id,
            name: candidate.name,
            profile_photo_url: candidate.profile_photo_url,
        },
        messages: [{ id: `msg-${Date.now()}`, author: MessageAuthor.USER, text: message }],
        lastMessageAt: new Date().toISOString(),
    };
    setConversations(prev => [...prev, newConversation]);
    closeConnectModal();
    addMessage(MessageAuthor.BOT, `Your connection request has been sent to ${candidate.name}.`, [], 'recruiter');
  };

  const approveConversation = (id:string) => {
      console.log('approveConversation', id);
      setConversations(convos => convos.map(c => c.id === id ? {...c, status: 'accepted'} : c));
  };
  const denyConversation = (id:string) => {
      console.log('denyConversation', id);
      setConversations(convos => convos.filter(c => c.id !== id));
  };

  useEffect(() => {
    if(userType === UserType.CANDIDATE) setQuickActions(candidateQuickActions);
    if(userType === UserType.RECRUITER) setQuickActions(recruiterQuickActions);
    if(userType === UserType.GUEST) setQuickActions([]);
  }, [userType]);

  useEffect(() => {
    if (userType === UserType.RECRUITER) {
        const allKnownCandidates = [...mockCandidates, ...foundCandidates.filter(fc => !mockCandidates.some(mc => mc.id === fc.id))];

        const contacted = conversations
            .filter(c => c.status === 'pending')
            .map(c => allKnownCandidates.find(cand => cand.id === c.other_participant.id))
            .filter((c): c is CandidateProfile => !!c);

        const engaged = conversations
            .filter(c => c.status === 'accepted')
            .map(c => allKnownCandidates.find(cand => cand.id === c.other_participant.id))
            .filter((c): c is CandidateProfile => !!c);
        
        const contactedIds = new Set(contacted.map(c => c.id));
        const engagedIds = new Set(engaged.map(c => c.id));

        const sourced = foundCandidates.filter(c => !contactedIds.has(c.id) && !engagedIds.has(c.id));
        
        setContactedCandidates(contacted);
        setEngagedCandidates(engaged);
        setSourcedCandidates(sourced);
    }
  }, [conversations, foundCandidates, userType]);


  return {
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
    // Recruiter pipeline state
    sourcedCandidates,
    contactedCandidates,
    engagedCandidates,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
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
  };
};
