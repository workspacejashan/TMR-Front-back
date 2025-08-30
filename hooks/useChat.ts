import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAuthor, ModalType, UserType, CandidateProfile, JobPostDetails, Conversation, Action, Skill, UploadedFile, DocumentVisibility, Job } from '../types';
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

const candidateSystemInstruction = `You are a friendly and professional AI recruiter for a job candidate. Your goal is to help them build their profile and find a job.
You can trigger actions for the user. When you identify an intent to perform an action, you use the corresponding action object. Do not perform actions for simple greetings.
- If the user wants to see their public profile, use action: { "type": "open_modal", "payload": { "modalType": "PUBLIC_PROFILE" } }
- If the user wants to see their messages, use action: { "type": "open_modal", "payload": { "modalType": "CANDIDATE_MESSAGES" } }
- If the user wants to see recruiter requests, use action: { "type": "open_modal", "payload": { "modalType": "RECRUITER_REQUESTS" } }
- If the user wants to see suggested jobs, use action: { "type": "open_modal", "payload": { "modalType": "SUGGESTED_JOBS" } }
- If the user wants to manage documents, use action: { "type": "open_modal", "payload": { "modalType": "DOCUMENTS_UPLOAD" } }
- If the user wants to manage skills, use action: { "type": "open_modal", "payload": { "modalType": "SKILLS_ASSESSMENT" } }
- If the user wants to set availability, use action: { "type": "open_modal", "payload": { "modalType": "AVAILABILITY" } }
- If the user wants to set job preferences, use action: { "type": "open_modal", "payload": { "modalType": "JOB_PREFERENCES" } }
- If the user wants to log out, use action: { "type": "logout" }

You MUST ALWAYS respond with a single valid JSON object. This object must have two keys: "text" (your friendly text response) and "action" (the action object if one is triggered, otherwise null).
Example response: { "text": "Sure, here are your messages.", "action": { "type": "open_modal", "payload": { "modalType": "CANDIDATE_MESSAGES" } } }
Example without action: { "text": "Hello! How can I help you today?", "action": null }`;

const recruiterSystemInstruction = `You are a helpful assistant for a recruiter. Keep your answers concise.
You can trigger actions for the user. When you identify an intent to perform an action, you use the corresponding action object.
- If the user wants to search for candidates, use action: { "type": "start_flow", "payload": { "flowName": "find_candidates" } }
- If the user wants to view messages, use action: { "type": "open_modal", "payload": { "modalType": "RECRUITER_MESSAGES" } }
- If the user wants to log out, use action: { "type": "logout" }

You MUST ALWAYS respond with a single valid JSON object. This object must have two keys: "text" (your friendly text response) and "action" (the action object if one is triggered, otherwise null).
Example response: { "text": "Of course, let's start a new search.", "action": { "type": "start_flow", "payload": { "flowName": "find_candidates" } } }`;


export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);
  const [quickActions, setQuickActions] = useState<Action[]>([]);
  
  // For Candidate user
  const [currentUser, setCurrentUser] = useState<CandidateProfile | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // For Recruiter user
  const [recruiterMessages, setRecruiterMessages] = useState<Message[]>([]);
  const [foundCandidates, setFoundCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [candidateToConnect, setCandidateToConnect] = useState<CandidateProfile | null>(null);
  const [isFindingCandidates, setIsFindingCandidates] = useState(false);
  
  // Recruiter find candidates flow state
  const [jobPostDetails, setJobPostDetails] = useState<Partial<JobPostDetails>>({});
  
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
    if (!currentUser?.roles?.length) return;
    setIsJobsLoading(true);
    const jobs = await jobSearchService.findJobs({ roles: currentUser.roles, location: currentUser.location || '' });
    setSuggestedJobs(jobs);
    setIsJobsLoading(false);
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
        setActiveModal(ModalType.FIND_CANDIDATES_FLOW);
    }
  }, [handleOpenModal, getSuggestedJobs, handleLogout]);
  
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
  
  const sendMessage = useCallback(async (text: string) => {
    const isRecruiter = userType === UserType.RECRUITER;
    const target = isRecruiter ? 'recruiter' : 'candidate';
    const history = isRecruiter ? recruiterMessages : messages;
    const instruction = isRecruiter ? recruiterSystemInstruction : candidateSystemInstruction;
    const actions = isRecruiter ? recruiterQuickActions : candidateQuickActions;

    addMessage(MessageAuthor.USER, text, [], target);
    setIsLoading(true);

    // Check if the user's message exactly matches a quick action label.
    const quickAction = actions.find(a => a.label === text);

    if (quickAction) {
      // If it's a quick action, provide a canned response and execute the action directly, skipping the AI call.
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

      const botResponseText = responseMap[text] || `Opening ${text.toLowerCase()}...`;
      
      addMessage(MessageAuthor.BOT, botResponseText, [], target);
      
      // Delay to allow the user to read the message before the modal opens.
      await new Promise(resolve => setTimeout(resolve, 900));
      
      handleAction(quickAction);
      
      setIsLoading(false);
      return; // Stop further execution
    }

    // The rest of the function handles non-quick-action messages with an AI call.
    if (aiService.isConfigured) {
      if (isRecruiter && (text.toLowerCase().includes('find candidate') || text.toLowerCase().includes('search for'))) {
            addMessage(MessageAuthor.BOT, "I can help with that. Let's refine the details for the role you're looking for.", [], 'recruiter');
            const criteria = await aiService.extractJobCriteria(text);
            setJobPostDetails(criteria);
            handleAction({ type: 'start_flow', payload: { flowName: 'find_candidates' } });
            setIsLoading(false);
            return;
      }

      const response = await aiService.getChatResponse([...history, {id: 'temp', author: MessageAuthor.USER, text}], instruction);
      addMessage(MessageAuthor.BOT, response.text, [], target);
      if (response.action) {
        handleAction(response.action);
      }
    } else {
      addMessage(MessageAuthor.BOT, "AI is not configured. Please set an API_KEY.", [], target);
    }
    
    setIsLoading(false);
  }, [messages, recruiterMessages, userType, addMessage, handleAction]);
  
  const handleLoginAs = (type: UserType, isGettingStarted = false) => {
      setUserType(type);
      setActiveModal(ModalType.NONE);

      const target = type === UserType.RECRUITER ? 'recruiter' : 'candidate';
      const user = type === UserType.CANDIDATE ? mockCandidateUser : mockRecruiterUser;
      
      setCurrentUser(user as CandidateProfile);
      setConversations(mockConversations);

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
  const sendConnectionRequest = (id:string, msg:string) => {
      console.log('sendConnectionRequest', id, msg);
      closeConnectModal();
      addMessage(MessageAuthor.BOT, `Your connection request has been sent.`, [], 'recruiter');
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
    selectedJob,
    quickActions,
    jobPostDetails,
    sendMessage,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
    openJobDetailsModal,
    closeJobDetailsModal,
    handleLoginAs,
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