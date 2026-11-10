import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';

import echo from '@/echo';

import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatThread } from '@/components/chat/chat-thread';
import { CreateGroupDialog } from '@/components/chat/create-group-dialog';

import type {
    ApiChatConversation,
    ApiChatMessage,
    ChatConversation,
    ChatMessage,
    ConversationFilter,
} from '@/types/chat';

type ChatPageProps = {
    conversations: ApiChatConversation[];
    currentUserId: string;
};

type MessagesResponse = {
    data: ApiChatMessage[];
};

type MessageResponse = {
    data: ApiChatMessage;
};

type MessageSentEvent = {
    message: ApiChatMessage;
};

function formatTime(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatUpdatedAt(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return formatTime(dateString);
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function mapMessage(
    message: ApiChatMessage,
    currentUserId: string,
): ChatMessage {
    const sender = message.sender;

    return {
        id: message.id,

        senderId:
            sender?.id === currentUserId
                ? 'you'
                : sender?.id ?? 'unknown',

        senderName: sender?.name ?? 'Unknown User',

        text: message.body,

        time: formatTime(message.created_at),
    };
}

function mapConversation(
    conversation: ApiChatConversation,
    currentUserId: string,
): ChatConversation {
    const isGroup = conversation.type === 'group';

    const otherParticipant = conversation.participants.find(
        (participant) => participant.id !== currentUserId,
    );

    const displayName = isGroup
        ? conversation.name ?? 'Unnamed Group'
        : otherParticipant?.name ?? 'Unknown User';

    const latestMessageData = conversation.latest_message;

    const latestMessage =
        latestMessageData?.id &&
            latestMessageData?.body !== undefined &&
            latestMessageData?.created_at
            ? mapMessage(latestMessageData, currentUserId)
            : undefined;

    return {
        id: conversation.id,

        type: conversation.type,

        visibility: conversation.visibility ?? undefined,

        name: displayName,

        initials: getInitials(displayName),

        subtitle: isGroup
            ? `${conversation.participants.length} members`
            : 'Direct Message',

        memberCount: conversation.participants.length,

        updatedAt: formatUpdatedAt(conversation.updated_at),

        unreadCount: conversation.unread_count ?? 0,

        messages: latestMessage ? [latestMessage] : [],
    };
}

export default function ChatPage({
    conversations: initialConversations,
    currentUserId,
}: ChatPageProps) {
    const [conversations, setConversations] = useState<
        ChatConversation[]
    >(() =>
        initialConversations.map((conversation) =>
            mapConversation(conversation, currentUserId),
        ),
    );

    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(
            conversations[0]?.id ?? null,
        );

    const [activeFilter, setActiveFilter] =
        useState<ConversationFilter>('all');

    const [search, setSearch] = useState('');

    const [isLoadingMessages, setIsLoadingMessages] =
        useState(false);

    const [isSendingMessage, setIsSendingMessage] =
        useState(false);

    const [messageError, setMessageError] =
        useState<string | null>(null);

    const [isCreateGroupOpen, setIsCreateGroupOpen] =
        useState(false);

    const activeConversation = conversations.find(
        (conversation) =>
            conversation.id === activeConversationId,
    );

    /**
     * Load messages whenever the selected conversation changes.
     */
    useEffect(() => {
        if (!activeConversationId) {
            return;
        }

        const controller = new AbortController();

        async function fetchMessages() {
            setIsLoadingMessages(true);
            setMessageError(null);

            try {
                const response = await fetch(
                    `/chat/${activeConversationId}`,
                    {
                        method: 'GET',
                        credentials: 'same-origin',

                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },

                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        'Failed to load messages.',
                    );
                }

                const result: MessagesResponse =
                    await response.json();

                const messages = result.data
                    .slice()
                    .reverse()
                    .map((message) =>
                        mapMessage(message, currentUserId),
                    );

                setConversations((previous) =>
                    previous.map((conversation) =>
                        conversation.id === activeConversationId
                            ? {
                                ...conversation,
                                messages,
                            }
                            : conversation,
                    ),
                );
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                setMessageError(
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong while loading messages.',
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingMessages(false);
                }
            }
        }

        void fetchMessages();

        return () => {
            controller.abort();
        };
    }, [activeConversationId, currentUserId]);

    /**
     * Real-time listener using Laravel Reverb.
     *
     * Subscribes to the currently selected conversation's
     * private channel and receives message.sent events.
     */
    useEffect(() => {
        if (!activeConversationId) {
            return;
        }

        const channelName =
            `conversation.${activeConversationId}`;

        const channel = echo.private(channelName);

        channel.listen(
            '.message.sent',
            (event: MessageSentEvent) => {
                const incomingMessage = mapMessage(
                    event.message,
                    currentUserId,
                );

                setConversations((previous) =>
                    previous.map((conversation) => {
                        if (
                            conversation.id !== activeConversationId
                        ) {
                            return conversation;
                        }

                        // Prevent duplicate messages.
                        const alreadyExists =
                            conversation.messages.some(
                                (message) =>
                                    message.id === incomingMessage.id,
                            );

                        if (alreadyExists) {
                            return conversation;
                        }

                        return {
                            ...conversation,

                            messages: [
                                ...conversation.messages,
                                incomingMessage,
                            ],

                            updatedAt: formatUpdatedAt(
                                event.message.created_at,
                            ),
                        };
                    }),
                );
            },
        );

        return () => {
            echo.leave(channelName);
        };
    }, [activeConversationId, currentUserId]);

    /**
     * Select a conversation.
     */
    function handleSelectConversation(
        conversationId: string,
    ) {
        setActiveConversationId(conversationId);
        setMessageError(null);

        setConversations((previous) =>
            previous.map((conversation) =>
                conversation.id === conversationId
                    ? {
                        ...conversation,
                        unreadCount: 0,
                    }
                    : conversation,
            ),
        );
    }

    /**
     * Add and open a newly created group.
     */
    function handleGroupCreated(
        createdConversation: ApiChatConversation,
    ) {
        const newConversation = mapConversation(
            createdConversation,
            currentUserId,
        );

        setConversations((previous) => [
            newConversation,

            ...previous.filter(
                (conversation) =>
                    conversation.id !== newConversation.id,
            ),
        ]);

        setActiveConversationId(newConversation.id);

        setActiveFilter('all');
        setSearch('');
        setMessageError(null);
    }

    /**
     * Send a message through the Laravel API.
     */
    async function handleSendMessage(message: string) {
        const body = message.trim();

        if (
            !activeConversationId ||
            !body ||
            isSendingMessage
        ) {
            return;
        }

        setIsSendingMessage(true);
        setMessageError(null);

        try {
            const csrfToken = document
                .querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )
                ?.content;

            const response = await fetch(
                `/chat/${activeConversationId}/messages`,
                {
                    method: 'POST',

                    credentials: 'same-origin',

                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',

                        ...(csrfToken
                            ? {
                                'X-CSRF-TOKEN': csrfToken,
                            }
                            : {}),
                    },

                    body: JSON.stringify({
                        body,
                    }),
                },
            );

            if (!response.ok) {
                const result = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    result?.message ??
                    'Failed to send message.',
                );
            }

            const result: MessageResponse =
                await response.json();

            const newMessage = mapMessage(
                result.data,
                currentUserId,
            );

            setConversations((previous) =>
                previous.map((conversation) =>
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,

                            messages: [
                                ...conversation.messages,
                                newMessage,
                            ],

                            updatedAt: formatUpdatedAt(
                                result.data.created_at,
                            ),
                        }
                        : conversation,
                ),
            );
        } catch (error) {
            setMessageError(
                error instanceof Error
                    ? error.message
                    : 'Something went wrong while sending your message.',
            );
        } finally {
            setIsSendingMessage(false);
        }
    }

    return (
        <>
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-4rem)] min-w-0 overflow-hidden rounded-xl border">
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    activeFilter={activeFilter}
                    search={search}
                    onFilterChange={setActiveFilter}
                    onSearchChange={setSearch}
                    onSelectConversation={
                        handleSelectConversation
                    }
                    onCreateGroup={() =>
                        setIsCreateGroupOpen(true)
                    }
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    {messageError && (
                        <div
                            role="alert"
                            className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
                        >
                            {messageError}
                        </div>
                    )}

                    {isLoadingMessages && (
                        <div className="border-b px-4 py-2 text-sm text-muted-foreground">
                            Loading messages...
                        </div>
                    )}

                    <ChatThread
                        conversation={activeConversation}
                        onSend={handleSendMessage}
                    />
                </div>
            </div>

            <CreateGroupDialog
                open={isCreateGroupOpen}
                onOpenChange={setIsCreateGroupOpen}
                onCreated={handleGroupCreated}
            />
        </>
    );
}