import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAuthor, ModalType, UserType, CandidateProfile, JobPostDetails, Conversation, Action, Skill, UploadedFile, DocumentVisibility, Job } from '../types';
import { geminiService } from '../services/geminiService';
import { jobSearchService } from '../services/jobSearchService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthError, Session, RealtimeChannel } from '@supabase/supabase-js';

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
You can trigger actions for the user. When you identify an intent to perform an action, you MUST include the corresponding action object in your JSON response. Do not perform actions for simple greetings.
- If the user wants to see their public profile, use: { "type": "open_modal", "payload": { "modalType": "PUBLIC_PROFILE" } }
- If the user wants to see their messages, use: { "type": "open_modal", "payload": { "modalType": "CANDIDATE_MESSAGES" } }
- If the user wants to see recruiter requests, use: { "type": "open_modal", "payload": { "modalType": "RECRUITER_REQUESTS" } }
- If the user wants to see suggested jobs, use: { "type": "open_modal", "payload": { "modalType": "SUGGESTED_JOBS" } }
- If the user wants to manage documents, use: { "type": "open_modal", "payload": { "modalType": "DOCUMENTS_UPLOAD" } }
- If the user wants to manage skills, use: { "type": "open_modal", "payload": { "modalType": "SKILLS_ASSESSMENT" } }
- If the user wants to set availability, use: { "type": "open_modal", "payload": { "modalType": "AVAILABILITY" } }
- If the user wants to set job preferences, use: { "type": "open_modal", "payload": { "modalType": "JOB_PREFERENCES" } }

Always provide a friendly text confirmation before the action. For example, if they ask to see messages, you could say "Sure, here are your messages." and then include the action object.`;

const recruiterSystemInstruction = `You are a helpful assistant for a recruiter. Keep your answers concise.
You can trigger actions for the user. When you identify an intent to perform an action, you MUST include the corresponding action object in your JSON response.
- If the user wants to search for candidates, use: { "type": "start_flow", "payload": { "flowName": "find_candidates" } }
- If the user wants to view messages, use: { "type": "open_modal", "payload": { "modalType": "RECRUITER_MESSAGES" } }

Always provide a friendly text confirmation before the action. For example, if they ask to search, you could say "Of course, let's start a new search." and then include the action object.`;


export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);
  const [quickActions, setQuickActions] = useState<Action[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // For Candidate user
  const [currentUser, setCurrentUser] = useState<CandidateProfile | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  // For Recruiter user
  const [recruiterMessages, setRecruiterMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [foundCandidates, setFoundCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [candidateToConnect, setCandidateToConnect] = useState<CandidateProfile | null>(null);
  
  // Recruiter find candidates flow state
  const [jobPostDetails, setJobPostDetails] = useState<Partial<JobPostDetails>>({});
  const [jobPostFlow, setJobPostFlow] = useState({ active: false, step: 0 });

  // Real-time messaging state
  const [messageListener, setMessageListener] = useState<RealtimeChannel | null>(null);
  
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
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
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
        setJobPostFlow({ active: true, step: 1 });
    }
  }, [handleOpenModal, getSuggestedJobs, handleLogout]);

  const sendMessage = useCallback(async (text: string) => {
    const isRecruiter = userType === UserType.RECRUITER;
    const target = isRecruiter ? 'recruiter' : 'candidate';
    const history = isRecruiter ? recruiterMessages : messages;
    const instruction = isRecruiter ? recruiterSystemInstruction : candidateSystemInstruction;

    addMessage(MessageAuthor.USER, text, [], target);
    setIsLoading(true);

    if (geminiService.isConfigured) {
      const response = await geminiService.getChatResponse([...history, {id: 'temp', author: MessageAuthor.USER, text}], instruction);
      addMessage(MessageAuthor.BOT, response.text, response.action ? [response.action] : [], target);
      if (response.action) {
        handleAction(response.action);
      }
    } else {
      addMessage(MessageAuthor.BOT, "AI is not configured.", [], target);
    }
    
    setIsLoading(false);
  }, [messages, recruiterMessages, userType, addMessage, handleAction]);

  const fetchUserProfile = useCallback(async (session: Session) => {
    if (!isSupabaseConfigured) return;
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`*, skills (*), documents (*)`)
        .eq('id', session.user.id)
        .single();
    
    if (error) {
        console.error("Error fetching profile:", error);
        handleLogout();
        return;
    }
    
    if (profile) {
        setCurrentUser(profile as CandidateProfile);
        setUserType(profile.user_type as UserType);
        
        if (profile.user_type === UserType.CANDIDATE) {
            if (!profile.name || !profile.title) {
                setActiveModal(ModalType.ONBOARDING_PROFILE);
            } else {
                addMessage(MessageAuthor.BOT, `Welcome back, ${profile.name}! What can I help you with today?`, candidateQuickActions);
            }
        } else if (profile.user_type === UserType.RECRUITER) {
             addMessage(MessageAuthor.BOT, `Welcome back, ${profile.name}! What can I help you with?`, recruiterQuickActions, 'recruiter');
        }
    }
  }, [addMessage, handleLogout]);

  const initializeSession = useCallback(async () => {
    if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserProfile(session);
        } else {
            setActiveModal(ModalType.AUTH);
        }
    } else {
        setUserType(UserType.CANDIDATE);
        addMessage(MessageAuthor.BOT, "Welcome! Since the app isn't connected to a backend, we'll proceed with a mock profile. What can I help you with?", candidateQuickActions);
        setCurrentUser({ id: 'mock-user', user_type: UserType.CANDIDATE, email: 'mock@user.com', name: 'Alex Doe', title: 'Registered Nurse', skills: [], documents: [], profile_photo_url: null, roles: null, shift: null, location: null, pay_expectations: null, contact_methods: null, time_zone: null, working_hours: null, call_available_hours: null });
    }
    setIsLoading(false);
  }, [fetchUserProfile, addMessage]);
  
  // Other functions...
  const updateProfile = async (profileData: Partial<CandidateProfile>) => {
      if (!currentUser || !isSupabaseConfigured) return;
      const { data, error } = await supabase.from('user_profiles').update(profileData).eq('id', currentUser.id).select().single();
      if (data) setCurrentUser(prev => ({ ...prev!, ...data }));
  };
  
  const updateSkills = async (newSkills: Skill[]) => {
      if (!currentUser || !isSupabaseConfigured) return;
      await supabase.from('skills').delete().eq('user_id', currentUser.id);
      await supabase.from('skills').insert(newSkills.map(s => ({...s, user_id: currentUser.id })));
      setCurrentUser(prev => ({...prev!, skills: newSkills}));
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
      if (!currentUser || !isSupabaseConfigured) return null;
      const filePath = `${currentUser.id}/${Date.now()}-${file.name}`;
      await supabase.storage.from('documents').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      const newDocument = { user_id: currentUser.id, name: file.name, size: file.size, type: file.type.split('/')[1] || 'file', file_path: filePath, visibility: 'private' as DocumentVisibility, url: urlData.publicUrl };
      const { data, error } = await supabase.from('documents').insert(newDocument).select().single();
      if (data) {
        setCurrentUser(prev => ({...prev!, documents: [...prev!.documents, data]}));
        return data;
      }
      return null;
  };
  
  const deleteFile = async (fileId: string) => {
      if (!currentUser || !isSupabaseConfigured) return;
      const fileToDelete = currentUser.documents.find(d => d.id === fileId);
      if (!fileToDelete) return;
      await supabase.storage.from('documents').remove([fileToDelete.file_path]);
      await supabase.from('documents').delete().eq('id', fileId);
      setCurrentUser(prev => ({...prev!, documents: prev!.documents.filter(d => d.id !== fileId)}));
  };
  
  const updateFileVisibility = async (fileId: string, visibility: DocumentVisibility) => {
    if (!currentUser || !isSupabaseConfigured) return;
    await supabase.from('documents').update({ visibility }).eq('id', fileId);
    setCurrentUser(prev => ({...prev!, documents: prev!.documents.map(d => d.id === fileId ? {...d, visibility} : d)}));
  };
  
  const handleAuthAction = async (authPromise: Promise<{ data: { session: Session | null }, error: AuthError | null }>) => {
    setAuthError(null);
    const { data, error } = await authPromise;
    if (error) {
      setAuthError(error.message);
      return error;
    }
    if (data.session) {
      await fetchUserProfile(data.session);
      setActiveModal(ModalType.NONE);
    }
    return null;
  };

  const handleSignUp = (email: string, password: string, userType: UserType) => handleAuthAction(supabase.auth.signUp({ email, password, options: { data: { user_type: userType } } }));
  const handleLogin = (email: string, password: string) => handleAuthAction(supabase.auth.signInWithPassword({ email, password }));

  // Dummy implementations for recruiter/messaging logic
  const sendChatMessage = (id:string, text:string) => console.log('sendChatMessage', id, text);
  const sendCandidateMessage = (id:string, text:string) => console.log('sendCandidateMessage', id, text);
  const viewCandidateProfile = (c: CandidateProfile) => setSelectedCandidate(c);
  const closeCandidateProfile = () => setSelectedCandidate(null);
  const openConnectModal = (c: CandidateProfile) => setCandidateToConnect(c);
  const closeConnectModal = () => setCandidateToConnect(null);
  const sendConnectionRequest = (id:string, msg:string) => console.log('sendConnectionRequest', id, msg);
  const approveConversation = (id:string) => console.log('approveConversation', id);
  const denyConversation = (id:string) => console.log('denyConversation', id);


  useEffect(() => {
    initializeSession();

    if (isSupabaseConfigured) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                handleLogout();
            }
        });
        return () => subscription.unsubscribe();
    }
  }, [initializeSession, handleLogout]);

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
    sendMessage,
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
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
  };
};
