import { Conversation, MessageAuthor } from "../types";

export const mockConversations: Conversation[] = [
    {
        id: 'convo-1',
        status: 'accepted',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        other_participant: {
            id: 'recruiter-1',
            name: 'Emily Carter from HealthCorp',
            profile_photo_url: 'https://i.pravatar.cc/150?u=emily_carter'
        },
        messages: [
            { id: 'msg-1', author: MessageAuthor.PARTICIPANT, text: "Hi! We have an opening for a Senior RN that looks like a great match for your skills. Are you available for a brief chat this week?" },
            { id: 'msg-2', author: MessageAuthor.USER, text: "Hi Emily, thanks for reaching out! I'm definitely interested. I'm available Wednesday afternoon." }
        ],
        lastMessageAt: new Date().toISOString()
    },
    {
        id: 'convo-2',
        status: 'pending',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        other_participant: {
            id: 'recruiter-2',
            name: 'Michael Chen from MedStaff',
            profile_photo_url: 'https://i.pravatar.cc/150?u=michael_chen'
        },
        messages: [
             { id: 'msg-3', author: MessageAuthor.PARTICIPANT, text: "Hello! I'm a recruiter with MedStaff and I'd like to connect regarding potential opportunities." }
        ],
        lastMessageAt: new Date(Date.now() - 172800000).toISOString()
    }
];