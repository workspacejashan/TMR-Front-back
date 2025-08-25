import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAuthor, ModalType, UserType, CandidateProfile, JobPostDetails, Conversation, Action, Skill, UploadedFile, DocumentVisibility } from '../types';
import { geminiService } from '../services/geminiService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthError, Session, RealtimeChannel } from '@supabase/supabase-js';

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

  // Real-time messaging state
  const [messageListener, setMessageListener] = useState<RealtimeChannel | null>(null);

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
                })) || []
            };
        })
    );
    
    setFoundCandidates(candidatesWithDetails);
    
    if (candidatesWithDetails.length > 0) {
        addBotMessage(`I found ${candidatesWithDetails.length} candidate(s) that match your criteria. You can view them in the "Candidates" tab.`, [], 'recruiter');
    } else {
        addBotMessage("I couldn't find any candidates that matched your criteria. You can try a broader search.", [], 'recruiter');
    }
    
    setIsLoading(false);
    setJobPostFlow({ active: false, step: 0 });
  }, [addBotMessage]);


  const sendMessage = useCallback(async (text: string) => {
    if (!isSupabaseConfigured) {
        addBotMessage("Sorry, the backend is not connected.");
        return;
    }
    
    if (userType === UserType.RECRUITER) {
        setRecruiterMessages(prev => [...prev, { id: `user-${Date.now()}`, author: MessageAuthor.USER, text }]);
        setIsLoading(true);

        if (jobPostFlow.active) {
            const criteria = await geminiService.extractJobCriteria(text);
            const newDetails = { ...jobPostDetails, ...criteria };
            setJobPostDetails(newDetails);

            if (!newDetails.title) {
                addBotMessage("What is the job title or role you are looking for?", [], 'recruiter');
            } else if (!newDetails.skills || newDetails.skills.length === 0) {
                 addBotMessage("What are the key skills required for this role?", [], 'recruiter');
            } else if (!newDetails.location) {
                addBotMessage("What is the location for this role? (e.g., 'New York, NY' or 'Remote')", [], 'recruiter');
            } else {
                await findCandidates(newDetails as JobPostDetails);
            }
        } else {
            // General recruiter chat logic (if any)
            const history = [...recruiterMessages, { id: 'temp', author: MessageAuthor.USER, text }];
            const response = await geminiService.getChatResponse(history, "You are a helpful assistant for a recruiter. Keep your answers concise.");
            addBotMessage(response, [], 'recruiter');
        }

        setIsLoading(false);
        return;
    }
    
    // Candidate interaction
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, author: MessageAuthor.USER, text }]);
    setIsLoading(true);

    // Placeholder for gemini logic
    const history = [...messages, { id: 'temp', author: MessageAuthor.USER, text }];
    const response = await geminiService.getChatResponse(history, "You are a friendly and professional AI recruiter for a job candidate. Your goal is to help them build their profile and find a job. When they ask for help, provide options via quick actions.");
    
    addBotMessage(response);
    setIsLoading(false);

  }, [messages, recruiterMessages, userType, jobPostFlow, jobPostDetails, addBotMessage, findCandidates]);

  const openModal = useCallback((modalType: ModalType) => setActiveModal(modalType), []);
  const closeModal = useCallback(() => setActiveModal(ModalType.NONE), []);

  const handleAction = useCallback((action: Action) => {
    switch (action.type) {
        case 'open_modal':
            if (action.payload?.modalType) {
                openModal(action.payload.modalType);
            }
            break;
        case 'start_flow':
            if (action.payload?.flowName === 'find_candidates') {
                setJobPostFlow({ active: true, step: 1 });
                setJobPostDetails({});
                setFoundCandidates([]);
                addBotMessage("Great! I can help with that. First, what's the job title you're looking for?", [], 'recruiter');
            }
            break;
        case 'logout':
            if (isSupabaseConfigured) {
              supabase.auth.signOut();
            } else {
               // Handle logout in non-supabase environment (e.g., clear state)
               setUserType(UserType.GUEST);
               setCurrentUser(null);
               setMessages([]);
               setRecruiterMessages([]);
               setConversations([]);
               setActiveModal(ModalType.AUTH);
            }
            break;
    }
  }, [openModal, addBotMessage]);
  
  const handleSignUp = async (email: string, password: string, selectedUserType: UserType): Promise<AuthError | null> => {
      if (!isSupabaseConfigured) {
          const errorMsg = "Backend is not configured. Cannot sign up.";
          setAuthError(errorMsg);
          return new AuthError(errorMsg);
      }
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: { user_type: selectedUserType }
          }
      });
      if (error) {
          setAuthError(error.message);
      } else if (data.user) {
          // Manually trigger profile creation if needed or let the trigger handle it
          // Then you might want to call initializeUser or just wait for onAuthStateChange
          setActiveModal(ModalType.NONE);
          if (selectedUserType === UserType.CANDIDATE) {
            openModal(ModalType.ONBOARDING_PROFILE);
          }
      }
      return error;
  };

  const handleLogin = async (email: string, password: string): Promise<AuthError | null> => {
      if (!isSupabaseConfigured) {
          const errorMsg = "Backend is not configured. Cannot log in.";
          setAuthError(errorMsg);
          return new AuthError(errorMsg);
      }
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
          setAuthError(error.message);
      } else {
          setActiveModal(ModalType.NONE);
      }
      return error;
  };
  
  const fetchConversations = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
    const { data: convoParticipants, error: convoParticipantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (convoParticipantsError || !convoParticipants) {
      console.error('Error fetching conversation participants:', convoParticipantsError);
      return;
    }

    const conversationIds = convoParticipants.map(p => p.conversation_id);
    if (conversationIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: convosData, error: convosError } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(*),
        conversation_participants!inner(
          user_id,
          user_profiles(id, name, profile_photo_url)
        )
      `)
      .in('id', conversationIds)
      .order('created_at', { referencedTable: 'messages', ascending: false });

    if (convosError || !convosData) {
      console.error('Error fetching conversations:', convosError);
      return;
    }

    const mappedConversations: Conversation[] = convosData.map((convo: any) => {
      const otherParticipantData = convo.conversation_participants.find((p: any) => p.user_id !== userId);
      const messages: Message[] = (convo.messages || []).map((msg: any) => ({
        id: msg.id.toString(),
        author: msg.sender_id === userId ? MessageAuthor.USER : MessageAuthor.PARTICIPANT,
        text: msg.text,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
      })).sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

      return {
        id: convo.id,
        status: convo.status,
        created_at: convo.created_at,
        other_participant: {
          id: otherParticipantData?.user_profiles?.id ?? '',
          name: otherParticipantData?.user_profiles?.name ?? 'Unknown User',
          profile_photo_url: otherParticipantData?.user_profiles?.profile_photo_url ?? null,
        },
        messages: messages,
        lastMessageAt: messages.length > 0 ? messages[messages.length - 1].created_at! : convo.created_at,
      };
    }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    setConversations(mappedConversations);
  }, []);

  const initializeUser = useCallback(async (session: Session) => {
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`*, skills(*), documents(*)`)
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        setIsLoading(false);
        return;
    }
    
    if (profile) {
        const fullProfile: CandidateProfile = {
            ...profile,
            documents: (profile.documents || []).map((doc: any) => ({
                ...doc,
                url: supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl
            }))
        };
        
        setCurrentUser(fullProfile);
        setUserType(profile.user_type as UserType);
        
        if (profile.user_type === UserType.CANDIDATE) {
            setQuickActions(candidateQuickActions);
            if (!profile.name || !profile.title) {
                setActiveModal(ModalType.ONBOARDING_PROFILE);
            }
            setMessages([{ id: 'init-bot', author: MessageAuthor.BOT, text: `Hi ${profile.name || 'there'}! I'm your personal AI recruiter. What would you like to do today?`, actions: candidateQuickActions }]);
        } else if (profile.user_type === UserType.RECRUITER) {
            setQuickActions(recruiterQuickActions);
            setRecruiterMessages([{ id: 'init-bot', author: MessageAuthor.BOT, text: `Hello! How can I help you find the best candidates today?`, actions: recruiterQuickActions }]);
        }
        
        fetchConversations(session.user.id);
    }
    setIsLoading(false);
  }, [fetchConversations]);

  useEffect(() => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
        setActiveModal(ModalType.AUTH);
        setIsLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            initializeUser(session);
        } else {
            setActiveModal(ModalType.AUTH);
            setIsLoading(false);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUserType(UserType.GUEST);
        setCurrentUser(null);
        setMessages([]);
        setRecruiterMessages([]);
        setConversations([]);
        setActiveModal(ModalType.AUTH);
      } else if (session) {
        initializeUser(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeUser]);

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser) return;

    const handleNewMessage = (payload: any) => {
        const newMessage = payload.new as any;
        setConversations(prevConvos => {
            if (!prevConvos.some(c => c.id === newMessage.conversation_id)) {
                return prevConvos;
            }

            const uiMessage: Message = {
                id: newMessage.id.toString(),
                author: newMessage.sender_id === currentUser.id ? MessageAuthor.USER : MessageAuthor.PARTICIPANT,
                text: newMessage.text,
                conversation_id: newMessage.conversation_id,
                sender_id: newMessage.sender_id,
                created_at: newMessage.created_at,
            };

            const newConversations = prevConvos.map(convo => {
                if (convo.id === newMessage.conversation_id) {
                    if (convo.messages.some(m => m.id === uiMessage.id)) return convo;
                    return { ...convo, messages: [...convo.messages, uiMessage] };
                }
                return convo;
            });
            
            const updatedConvoIndex = newConversations.findIndex(c => c.id === newMessage.conversation_id);
            if (updatedConvoIndex > 0) {
                const [updatedConvo] = newConversations.splice(updatedConvoIndex, 1);
                newConversations.unshift(updatedConvo);
            }
            return newConversations;
        });
    };
    
    const handleConvoUpdate = (payload: any) => {
        const updatedConvo = payload.new as any;
        setConversations(prev => prev.map(c => c.id === updatedConvo.id ? { ...c, status: updatedConvo.status } : c));
    };

    const channel = supabase.channel('realtime:all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, handleConvoUpdate)
      .subscribe();

    setMessageListener(channel);

    return () => {
      if (messageListener) {
        supabase.removeChannel(messageListener);
      }
    };
  }, [currentUser]);

  const updateProfile = useCallback(async (profileData: Partial<CandidateProfile>) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', currentUser.id)
      .select()
      .single();
    if (!error && data) {
      setCurrentUser(prev => ({ ...(prev as CandidateProfile), ...data }));
    }
  }, [currentUser]);

  const updateSkills = useCallback(async (newSkills: Skill[]) => {
    if (!currentUser) return;
    // Simple approach: delete all and re-insert
    await supabase.from('skills').delete().eq('user_id', currentUser.id);
    const skillsToInsert = newSkills.map(({ name, level }) => ({ user_id: currentUser.id, name, level }));
    const { data, error } = await supabase.from('skills').insert(skillsToInsert).select();
    
    if (!error && data) {
       setCurrentUser(prev => ({...(prev as CandidateProfile), skills: data}));
    }
  }, [currentUser]);
  
  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    if (!currentUser) return null;
    const filePath = `${currentUser.id}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }
    
    const { data, error } = await supabase.from('documents').insert({
      user_id: currentUser.id,
      file_path: filePath,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
    }).select().single();
    
    if (error || !data) {
      console.error("DB insert error:", error);
      return null;
    }
    
    const newFile: UploadedFile = {
        ...data,
        url: supabase.storage.from('documents').getPublicUrl(data.file_path).data.publicUrl
    };
    setCurrentUser(prev => ({...(prev as CandidateProfile), documents: [...(prev?.documents || []), newFile]}));
    return newFile;
  }, [currentUser]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!currentUser) return;
    const fileToDelete = currentUser.documents.find(d => d.id === fileId);
    if (!fileToDelete) return;

    await supabase.storage.from('documents').remove([fileToDelete.file_path]);
    await supabase.from('documents').delete().eq('id', fileId);
    
    setCurrentUser(prev => ({...(prev as CandidateProfile), documents: prev!.documents.filter(d => d.id !== fileId)}));
  }, [currentUser]);
  
  const updateFileVisibility = useCallback(async (fileId: string, visibility: DocumentVisibility) => {
    const { error } = await supabase.from('documents').update({ visibility }).eq('id', fileId);
    if (!error) {
       setCurrentUser(prev => ({
           ...(prev as CandidateProfile),
           documents: prev!.documents.map(d => d.id === fileId ? {...d, visibility} : d)
       }));
    }
  }, []);

  const viewCandidateProfile = (candidate: CandidateProfile) => {
      setSelectedCandidate(candidate);
      openModal(ModalType.PUBLIC_PROFILE);
  };
  
  const closeCandidateProfile = () => {
      setSelectedCandidate(null);
      closeModal();
  };
  
  const openConnectModal = (candidate: CandidateProfile) => {
    setCandidateToConnect(candidate);
    setActiveModal(ModalType.CONNECT_REQUEST);
  };

  const closeConnectModal = () => {
    setCandidateToConnect(null);
    setActiveModal(ModalType.PUBLIC_PROFILE); // Or NONE if you prefer
  };
  
  const sendConnectionRequest = useCallback(async (candidateId: string, initialMessage: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    
    // 1. Create conversation
    const { data: convoData, error: convoError } = await supabase
      .from('conversations')
      .insert({ status: 'pending' })
      .select()
      .single();
    
    if (convoError || !convoData) {
        console.error("Error creating conversation:", convoError);
        setIsLoading(false);
        return;
    }
    
    // 2. Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: convoData.id, user_id: currentUser.id },
      { conversation_id: convoData.id, user_id: candidateId }
    ]);
    
    // 3. Send initial message
    await supabase.from('messages').insert({
      conversation_id: convoData.id,
      sender_id: currentUser.id,
      text: initialMessage
    });
    
    // 4. Update local state & UI
    await fetchConversations(currentUser.id); // Refresh conversations
    addBotMessage("Your connection request has been sent!", [], 'recruiter');
    closeConnectModal();
    closeCandidateProfile();
    setIsLoading(false);
  }, [currentUser, addBotMessage, fetchConversations]);

  const sendMessageToConversation = useCallback(async (conversationId: string, text: string) => {
    if (!isSupabaseConfigured || !currentUser) return;

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      text: text,
    });
  }, [currentUser]);

  const approveConversation = useCallback(async (conversationId: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('conversations').update({ status: 'accepted' }).eq('id', conversationId);
    if (!error) {
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status: 'accepted' } : c));
    }
  }, []);
  
  const denyConversation = useCallback(async (conversationId: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('conversations').update({ status: 'denied' }).eq('id', conversationId);
    if (!error) {
       setConversations(prev => prev.filter(c => c.id !== conversationId));
    }
  }, []);

  return {
    messages,
    recruiterMessages,
    isLoading,
    activeModal,
    userType,
    currentUser,
    foundCandidates,
    selectedCandidate,
    candidateToConnect,
    conversations,
    quickActions,
    authError,
    sendMessage,
    openModal,
    closeModal,
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
    sendChatMessage: sendMessageToConversation,
    sendCandidateMessage: sendMessageToConversation,
    openConnectModal,
    closeConnectModal,
    sendConnectionRequest,
    approveConversation,
    denyConversation,
  };
};