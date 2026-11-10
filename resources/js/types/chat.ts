
export type ConversationType = 'direct' | 'group';

export type ConversationVisibility = 'public' | 'private';

export type ConversationFilter = 'all' | 'direct' | 'groups';

export type ConversationParticipant = {
    id: string;
    name: string;
    role: string;
};

export type ApiChatMember = {
    id: string;
    name: string;
};

export type ApiChatMessage = {
    id: string;
    conversation_id: string;
    sender?: {
        id: string;
        name: string;
    } | null;
    body: string;
    created_at: string;
    updated_at: string;
};

export type ApiChatConversation = {
    id: string;
    type: ConversationType;
    name: string | null;
    visibility: ConversationVisibility | null;
    creator: {
        id: string;
        name: string;
    };
    participants: ConversationParticipant[];
    latest_message: ApiChatMessage | null;
    unread_count: number;
    created_at: string;
    updated_at: string;
};

export type ChatMessage = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    time: string;
};

export type ChatConversation = {
    id: string;
    type: ConversationType;
    visibility?: ConversationVisibility;
    name: string;
    initials: string;
    subtitle: string;
    memberCount?: number;
    isOnline?: boolean;
    updatedAt: string;
    unreadCount: number;
    messages: ChatMessage[];
};
