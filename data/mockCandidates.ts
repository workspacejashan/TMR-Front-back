import { CandidateProfile, UserType, Skill, UploadedFile, DocumentVisibility } from "../types";

const mockSkills: Skill[] = [
    { id: 1, name: 'IV Insertion', level: 4 },
    { id: 2, name: 'Patient Care', level: 3 },
    { id: 3, name: 'Triage', level: 4 },
    { id: 4, name: 'Medication Administration', level: 3 },
];

const mockDocuments: UploadedFile[] = [
    { 
        id: 'doc-1', 
        name: 'Resume_JaneDoe.pdf', 
        size: 125829, 
        type: 'pdf', 
        visibility: 'public' as DocumentVisibility, 
        file_path: '/mock/resume.pdf',
        url: '#'
    },
    { 
        id: 'doc-2', 
        name: 'Nursing_License.pdf', 
        size: 89345, 
        type: 'pdf', 
        visibility: 'gated' as DocumentVisibility,
        file_path: '/mock/license.pdf',
        url: '#'
    },
];

export const mockCandidates: CandidateProfile[] = [
    {
        id: 'candidate-1',
        email: 'jane.doe@example.com',
        user_type: UserType.CANDIDATE,
        name: 'Jane Doe',
        title: 'Senior Registered Nurse',
        profile_photo_url: 'https://i.pravatar.cc/150?u=jane_doe',
        roles: ['Registered Nurse', 'Clinical Nurse Specialist'],
        shift: 'Day Shift',
        location: 'New York, NY',
        pay_expectations: '$100 - $125 / hour',
        contact_methods: ['text'],
        time_zone: 'America/New_York',
        working_hours: '9:00 AM - 5:00 PM (Mon-Fri)',
        call_available_hours: 'After Work (5pm - 7pm)',
        skills: mockSkills,
        documents: mockDocuments
    },
    {
        id: 'candidate-2',
        email: 'john.smith@example.com',
        user_type: UserType.CANDIDATE,
        name: 'John Smith',
        title: 'Pediatric Nurse Practitioner',
        profile_photo_url: 'https://i.pravatar.cc/150?u=john_smith',
        roles: ['Nurse Practitioner'],
        shift: 'Flexible Schedule',
        location: 'Austin, TX',
        pay_expectations: '$125+ / hour',
        contact_methods: ['call', 'text'],
        time_zone: 'America/Chicago',
        working_hours: 'Flexible Schedule',
        call_available_hours: 'Mornings (9am - 12pm)',
        skills: [
            { name: 'Pediatric Care', level: 4 },
            { name: 'Diagnosis', level: 3 },
            { name: 'Patient Education', level: 4 },
        ],
        documents: [
            { 
                id: 'doc-3', 
                name: 'CV_JohnSmith.pdf', 
                size: 210450, 
                type: 'pdf', 
                visibility: 'public' as DocumentVisibility,
                file_path: '/mock/cv.pdf',
                url: '#'
            },
        ]
    }
];