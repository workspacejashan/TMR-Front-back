import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAuthor, ModalType, UserType, CandidateProfile, JobPostDetails, Conversation, Action, Skill, UploadedFile, DocumentVisibility } from '../types';
import { geminiService } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthError, Session } from '@supabase/supabase-js';

const candidateQuickActions: Action[] = [
    { label: "View Public Profile", type: 'open_modal', payload: { modalType: ModalType.PUBLIC_PROFILE } },
    { label: "Messages", type: 'open_modal', payload: { modalType: ModalType.CANDIDATE_MESSAGES } },
    { label: "Recruiter Requests", type: 'open_modal', payload: { modalType: ModalType.RECRUITER_REQUESTS } },
    // { label: "Jobs", type: 'open_modal', payload: { modalType: ModalType.SUGGESTED_JOBS } },
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [userType, setUserType] = useState<UserType>(UserType.GUEST);
  const [quickActions, setQuickActions] = useState<Action[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // For Candidate user
  const [currentUser, setCurrentUser] = useState<CandidateProfile | null>(null);

  // For Recruiter user
  const [recruiterMessages, setRecruiterMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [foundCandidates, setFoundCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [candidateToConnect, setCandidateToConnect] = useState<CandidateProfile | null>(null);
  
  // Recruiter find candidates flow state
  const [jobPostDetails, setJobPostDetails] = useState<Partial<JobPostDetails>>({});
  const [jobPostFlow, setJobPostFlow] = useState({ active: false, step: 0 });

  const addBotMessage = useCallback((text: string, actions: Action[] = [], target: 'candidate' | 'recruiter' = 'candidate') => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        author: MessageAuthor.BOT,
        text,
        actions,
      };
      const setTarget = target === 'recruiter' ? setRecruiterMessages : setMessages;
      setTarget(prev => [...prev, botMessage]);
  }, []);

  const findCandidates = useCallback(async (details: JobPostDetails) => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    addBotMessage(`Great! I'm searching for candidates that match your criteria for a "${details.title}"...`, [], 'recruiter');

    const { data, error } = await supabase.rpc('search_candidates', {
        p_skills: details.skills,
        p_location: details.location
    });

    if (error) {
        console.error("Error searching candidates:", error);
        addBotMessage(`Sorry, I encountered an error while searching: ${error.message}`, [], 'recruiter');
        setIsLoading(false);
        return;
    }

    const candidatesWithDetails = await Promise.all(
        (data || []).map(async (profile: any) => {
            const { data: skills } = await supabase.from('skills').select('*').eq('user_id', profile.id);
            const { data: documents } = await supabase.from('documents').select('*').eq('user_id', profile.id).in('visibility', ['public', 'gated']);
            return { 
                ...profile, 
                skills: skills || [],
                documents: documents?.map(d => ({
                    ...d,
                    url: supabase.storage.from('documents').getPublicUrl(d.file_path).data.publicUrl,
                })) || [],
            };
        })
    );
    
    setFoundCandidates(candidatesWithDetails);
    addBotMessage(`Based on your criteria, I've found ${candidatesWithDetails.length} strong candidates for you to review.`, 
        [{ label: "View Candidates", type: 'open_modal', payload: { modalType: ModalType.FOUND_CANDIDATES } }], 'recruiter');

    setIsLoading(false);
  }, [addBotMessage]);

  const sendMessage = useCallback(
    async (text: string) => {
      const target = userType === UserType.RECRUITER ? 'recruiter' : 'candidate';
      const setTargetMessages = target === 'recruiter' ? setRecruiterMessages : setMessages;
      const currentMessages = target === 'recruiter' ? recruiterMessages : messages;

      const userMessage: Message = { id: `user-${Date.now()}`, author: MessageAuthor.USER, text };
      setTargetMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      if (userType === UserType.RECRUITER && jobPostFlow.active) {
          const newDetails = { ...jobPostDetails };
          if (jobPostFlow.step === 0) {
              newDetails.title = text.trim();
              setJobPostDetails(newDetails);
              addBotMessage("Got it. Now, what are the most important skills for this role? Please list them, separated by commas.", [], 'recruiter');
              setJobPostFlow({ active: true, step: 1 });
          } else if (jobPostFlow.step === 1) {
              newDetails.skills = text.trim().split(',').map(s => s.trim());
              setJobPostDetails(newDetails);
              addBotMessage("Perfect. Lastly, what is the work location for this position? (e.g., 'New York, NY', 'Remote')", [], 'recruiter');
              setJobPostFlow({ active: true, step: 2 });
          } else if (jobPostFlow.step === 2) {
              newDetails.location = text.trim();
              setJobPostDetails(newDetails);
              await findCandidates(newDetails as JobPostDetails);
              setJobPostFlow({ active: false, step: 0 });
          }
          setIsLoading(false);
          return;
      }

      if (geminiService.isConfigured) {
          const systemInstruction = userType === UserType.CANDIDATE
            ? "You are an AI assistant for 'ThatsMyRecruiter'. Guide candidates through setting up their profile and managing their job search. Be encouraging and concise."
            : "You are an AI assistant for a recruiter on 'ThatsMyRecruiter'. Help them find candidates and manage communications. You can ask them to clarify job requirements. Keep responses brief and professional.";
          
          const responseText = await geminiService.getChatResponse([...currentMessages, userMessage], systemInstruction);
          addBotMessage(responseText, [], target);
      } else {
          addBotMessage("AI service is not configured. Please check the console for instructions.", [], target);
      }
      setIsLoading(false);
    },
    [userType, messages, recruiterMessages, addBotMessage, jobPostFlow, jobPostDetails, findCandidates]
  );
  
  const loadConversations = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data: participantEntries, error: participantError } = await supabase
        .from('conversation_participants').select('conversation_id').eq('user_id', userId);
    
    if (participantError || !participantEntries) return;

    const conversationIds = participantEntries.map(p => p.conversation_id);
    if (conversationIds.length === 0) {
        setConversations([]);
        return;
    }

    const { data: convosData, error: convosError } = await supabase.from('conversations')
      .select(`*, participants:conversation_participants(profile:user_profiles(id, name, profile_photo_url))`)
      .in('id', conversationIds);

    if (convosError || !convosData) return;

    const finalConvos = await Promise.all(convosData.map(async (convo: any) => {
        const otherParticipant = convo.participants.find((p: any) => p.profile.id !== userId)?.profile;
        const { data: lastMessage } = await supabase.from('messages').select('text, created_at').eq('conversation_id', convo.id).order('created_at', { ascending: false }).limit(1).single();

        return {
            id: convo.id,
            status: convo.status,
            created_at: convo.created_at,
            other_participant: otherParticipant,
            messages: [],
            lastMessageAt: lastMessage?.created_at || convo.created_at,
        };
    }));

    finalConvos.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    setConversations(finalConvos);
  }, []);

  const loadUserProfile = useCallback(async (session: Session) => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    const { user } = session;
    const { data: profile, error } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();

    if (error || !profile) {
        console.error("Error fetching profile:", error);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
    }

    const typedUserType = profile.user_type as UserType;
    setUserType(typedUserType);
    setActiveModal(ModalType.NONE);

    await loadConversations(user.id);

    if (typedUserType === UserType.CANDIDATE) {
        const { data: skills } = await supabase.from('skills').select('*').eq('user_id', user.id);
        const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id);
        
        const fullProfile: CandidateProfile = {
            ...profile,
            skills: skills || [],
            documents: documents?.map(d => ({
                ...d,
                url: supabase.storage.from('documents').getPublicUrl(d.file_path).data.publicUrl,
            })) || [],
        };
        setCurrentUser(fullProfile);
        setQuickActions(candidateQuickActions);

        if (!fullProfile.name || !fullProfile.title) {
            addBotMessage("Welcome to ThatsMyRecruiter! I'm your personal AI recruiter. My goal is to streamline your job search and give you full control. To start, let's build your professional profile.", 
                [{ label: "Setup Profile", type: 'open_modal', payload: { modalType: ModalType.ONBOARDING_PROFILE } }]);
        } else {
            addBotMessage("Welcome back! It's great to see you again. What would you like to do today?");
        }

    } else if (typedUserType === UserType.RECRUITER) {
        // We set a placeholder CandidateProfile for recruiters for simplicity
        setCurrentUser({ ...profile, skills: [], documents: [] });
        setRecruiterMessages([]);
        setQuickActions(recruiterQuickActions);
        addBotMessage("Welcome back to your Recruiter Dashboard. How can I help you today?", [], 'recruiter');
    }
    setIsLoading(false);
  }, [addBotMessage, loadConversations]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setActiveModal(ModalType.AUTH);
      setIsLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session);
      } else {
        setActiveModal(ModalType.AUTH);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUserProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setMessages([]);
        setRecruiterMessages([]);
        setIsLoading(false);
        setActiveModal(ModalType.AUTH);
        setUserType(UserType.GUEST);
        setQuickActions([]);
        setCurrentUser(null);
        setConversations([]);
        setFoundCandidates([]);
        setSelectedCandidate(null);
        setCandidateToConnect(null);
        setJobPostDetails({});
        setJobPostFlow({ active: false, step: 0 });
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadUserProfile]);
  
  const handleSignUp = async (email: string, password: string, userType: UserType): Promise<AuthError | null> => {
      if (!isSupabaseConfigured) { setAuthError("Application not configured."); return null; }
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { user_type: userType } } });
      if (error) setAuthError(error.message);
      if (!error && !data.session) setAuthError("Please check your email to confirm registration.");
      return error;
  };

  const handleLogin = async (email: string, password: string): Promise<AuthError | null> => {
      if (!isSupabaseConfigured) { setAuthError("Application not configured."); return null; }
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      return error;
  };

  const openModal = useCallback((modalType: ModalType) => setActiveModal(modalType), []);
  const closeModal = useCallback(() => setActiveModal(ModalType.NONE), []);
  
  const handleAction = useCallback(async (action: Action) => {
      if (action.type === 'start_flow' && action.payload?.flowName === 'find_candidates') {
          setJobPostDetails({});
          setJobPostFlow({ active: true, step: 0 });
          addBotMessage("I can help with that. Let's create a job profile. First, what is the job title or primary role?", [], 'recruiter');
      } else if (action.type === 'open_modal' && action.payload?.modalType) {
          openModal(action.payload.modalType);
      } else if (action.type === 'logout') {
          if (isSupabaseConfigured) await supabase.auth.signOut();
      }
  }, [addBotMessage, openModal]);

  const viewCandidateProfile = useCallback((candidate: CandidateProfile) => {
      setSelectedCandidate(candidate);
      openModal(ModalType.PUBLIC_PROFILE);
  }, [openModal]);
  
  const closeCandidateProfile = useCallback(() => {
    setSelectedCandidate(null);
    closeModal();
  }, [closeModal]);

  const openConnectModal = useCallback((candidate: CandidateProfile) => {
    setCandidateToConnect(candidate);
    setActiveModal(ModalType.CONNECT_REQUEST);
  }, []);

  const closeConnectModal = useCallback(() => {
    setCandidateToConnect(null);
    setActiveModal(ModalType.NONE);
  }, []);

  const updateProfile = async (profileData: Partial<CandidateProfile>) => {
    if (!isSupabaseConfigured || !currentUser) return;
    const { error } = await supabase.from('user_profiles').update(profileData).eq('id', currentUser.id);
    if (!error) setCurrentUser(curr => curr ? {...curr, ...profileData} : null);
    else console.error("Error updating profile:", error);
  };

  const updateSkills = async (newSkills: Skill[]) => {
      if (!isSupabaseConfigured || !currentUser) return;
      await supabase.from('skills').delete().eq('user_id', currentUser.id);
      const { error } = await supabase.from('skills').insert(newSkills.map(s => ({...s, user_id: currentUser.id })));
      if (!error) setCurrentUser(curr => curr ? {...curr, skills: newSkills } : null);
      else console.error("Error updating skills:", error);
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (!isSupabaseConfigured || !currentUser) return null;
    const filePath = `${currentUser.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) { console.error("Upload error:", uploadError); return null; }

    const { data: docData, error: insertError } = await supabase.from('documents').insert({
        user_id: currentUser.id, file_path: filePath, name: file.name, size: file.size,
        type: file.name.split('.').pop() || 'file', visibility: 'gated',
    }).select().single();

    if (insertError) { console.error("DB insert error:", insertError); return null; }
    
    const newFile: UploadedFile = { ...docData, url: supabase.storage.from('documents').getPublicUrl(docData.file_path).data.publicUrl };
    setCurrentUser(curr => curr ? {...curr, documents: [...curr.documents, newFile]} : null);
    return newFile;
  };
  
  const deleteFile = async (fileId: string) => {
    if (!isSupabaseConfigured || !currentUser) return;
    const fileToDelete = currentUser.documents.find(d => d.id === fileId);
    if (!fileToDelete) return;

    await supabase.storage.from('documents').remove([fileToDelete.file_path]);
    await supabase.from('documents').delete().eq('id', fileId);
    setCurrentUser(curr => curr ? {...curr, documents: curr.documents.filter(d => d.id !== fileId)} : null);
  };
  
  const updateFileVisibility = async (fileId: string, visibility: DocumentVisibility) => {
    if (!isSupabaseConfigured || !currentUser) return;
    const { error } = await supabase.from('documents').update({ visibility }).eq('id', fileId);
    if (!error) setCurrentUser(curr => curr ? {...curr, documents: curr.documents.map(d => d.id === fileId ? {...d, visibility} : d)} : null);
  };
  
  const sendConnectionRequest = async (candidateId: string, message: string) => {
    if (!isSupabaseConfigured || !currentUser || userType !== UserType.RECRUITER) return;
    
    const { data: convoData, error: convoError } = await supabase.from('conversations').insert({ status: 'pending' }).select().single();
    if (convoError || !convoData) { console.error(convoError); return; }

    await supabase.from('conversation_participants').insert([
        { conversation_id: convoData.id, user_id: currentUser.id },
        { conversation_id: convoData.id, user_id: candidateId },
    ]);
    await supabase.from('messages').insert({ conversation_id: convoData.id, sender_id: currentUser.id, text: message });

    closeConnectModal();
    await loadConversations(currentUser.id);
  };
  
  // Placeholder for real implementations
  const sendChatMessage = (conversationId: string, text: string) => {};
  const sendCandidateMessage = (conversationId: string, text: string) => {};

  return {
    messages, recruiterMessages, isLoading, activeModal, userType, currentUser,
    foundCandidates, selectedCandidate, candidateToConnect, conversations,
    quickActions, authError, sendMessage, openModal, closeModal, handleSignUp, handleLogin,
    handleAction, updateProfile, updateSkills, uploadFile, deleteFile, updateFileVisibility,
    viewCandidateProfile, closeCandidateProfile, sendChatMessage, sendCandidateMessage,
    openConnectModal, closeConnectModal, sendConnectionRequest,
  };
};
