export type ChatMessage = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    time: string;
};

export type ChatConversation = {
    id: string;
    type: 'direct' | 'group';
    visibility?: 'public' | 'private';
    name: string;
    initials: string;
    subtitle: string;
    memberCount?: number;
    isOnline?: boolean;
    updatedAt: string;
    unreadCount: number;
    messages: ChatMessage[];
};

export const currentUserId = 'you';

export const initialConversations: ChatConversation[] = [
    {
        id: 'mika-santos',
        type: 'direct',
        name: 'Mika Santos',
        initials: 'MS',
        subtitle: 'Arts & Culture Club',
        isOnline: true,
        updatedAt: '10:42 AM',
        unreadCount: 2,
        messages: [
            {
                id: 'mika-1',
                senderId: 'mika',
                senderName: 'Mika Santos',
                text: 'Are you going to the organization fair next week?',
                time: '10:36 AM',
            },
            {
                id: 'mika-2',
                senderId: currentUserId,
                senderName: 'You',
                text: 'Yes! I want to check out the art club booth.',
                time: '10:38 AM',
            },
            {
                id: 'mika-3',
                senderId: 'mika',
                senderName: 'Mika Santos',
                text: 'Same here. We are putting together a little campus mural activity.',
                time: '10:42 AM',
            },
        ],
    },
    {
        id: 'alex-rivera',
        type: 'direct',
        name: 'Alex Rivera',
        initials: 'AR',
        subtitle: 'Student · Year 2',
        updatedAt: 'Yesterday',
        unreadCount: 0,
        messages: [
            {
                id: 'alex-1',
                senderId: 'alex',
                senderName: 'Alex Rivera',
                text: 'Do you have the notes from the last workshop?',
                time: 'Yesterday',
            },
            {
                id: 'alex-2',
                senderId: currentUserId,
                senderName: 'You',
                text: 'I do. I can send them over after class.',
                time: 'Yesterday',
            },
        ],
    },
    {
        id: 'arts-culture',
        type: 'group',
        visibility: 'public',
        name: 'Arts & Culture Club',
        initials: 'AC',
        subtitle: 'Campus organization',
        memberCount: 28,
        updatedAt: '10:18 AM',
        unreadCount: 4,
        messages: [
            {
                id: 'arts-1',
                senderId: 'jules',
                senderName: 'Jules Mendoza',
                text: 'The mural planning session is in the student lounge at 3.',
                time: '10:10 AM',
            },
            {
                id: 'arts-2',
                senderId: 'mika',
                senderName: 'Mika Santos',
                text: 'I will bring the color swatches!',
                time: '10:18 AM',
            },
        ],
    },
    {
        id: 'volunteer-coordinators',
        type: 'group',
        visibility: 'private',
        name: 'Volunteer Coordinators',
        initials: 'VC',
        subtitle: 'Campus Volunteers',
        memberCount: 12,
        updatedAt: 'Mon',
        unreadCount: 0,
        messages: [
            {
                id: 'volunteer-1',
                senderId: 'noah',
                senderName: 'Noah Reyes',
                text: 'We still need two people to help set up the clean-up check-in table.',
                time: 'Mon',
            },
            {
                id: 'volunteer-2',
                senderId: currentUserId,
                senderName: 'You',
                text: 'I can help with that.',
                time: 'Mon',
            },
        ],
    },
];
