export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
  PARTICIPANT = 'participant',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  actions?: Action[];
  // DB related fields
  conversation_id?: string;
  sender_id?: string;
  created_at?: string;
}

export interface Action {
  label?:string;
  type: 'open_modal' | 'start_flow' | 'logout';
  payload?: {
    modalType?: ModalType;
    flowName?: 'find_candidates';
  };
}

export enum UserType {
  GUEST = 'GUEST',
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
}

export enum ModalType {
  AUTH,
  NONE,
  ONBOARDING_PROFILE,
  DOCUMENTS_UPLOAD,
  JOB_PREFERENCES,
  SKILLS_ASSESSMENT,
  AVAILABILITY,
  RECRUITER_REQUESTS,
  SUGGESTED_JOBS,
  PUBLIC_PROFILE,
  RECRUITER_MESSAGES,
  FOUND_CANDIDATES,
  CONNECT_REQUEST,
  CANDIDATE_MESSAGES,
  FIND_CANDIDATES_FLOW,
}

// Corresponds to the `user_profiles` table
export interface CandidateProfile {
    id: string;
    email: string | null;
    user_type: UserType;
    name: string | null;
    title: string | null;
    profile_photo_url: string | null;
    roles: string[] | null;
    shift: string | null;
    location: string | null;
    pay_expectations: string | null;
    contact_methods: Array<'call' | 'text'> | null;
    time_zone: string | null;
    working_hours: string | null;
    call_available_hours: string | null;
    updated_at?: string;
    // Joined data from other tables
    skills: Skill[];
    documents: UploadedFile[];
}

export interface JobPostDetails {
    title: string;
    skills: string[];
    location: string;
}

// Corresponds to the `skills` table
export interface Skill {
    id?: number;
    user_id?: string;
    name: string;
    level: 1 | 2 | 3 | 4;
}

export type DocumentVisibility = 'public' | 'gated' | 'private';

// Corresponds to the `documents` table
export interface UploadedFile {
    id: string;
    user_id?: string;
    file_path: string;
    name: string;
    size: number;
    type: string;
    visibility: DocumentVisibility;
    created_at?: string;
    // Client-side only property for previews
    url: string; 
}

// Corresponds to `conversations` table joined with participant info
export interface Conversation {
  id: string;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  // Denormalized/joined data
  other_participant: {
    id: string;
    name: string | null;
    profile_photo_url: string | null;
  }
  messages: Message[];
  lastMessageAt: string; // This will be derived client-side
}

// Represents a job listing from an external API
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    applyUrl: string;
}
