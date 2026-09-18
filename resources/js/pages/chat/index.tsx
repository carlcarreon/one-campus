import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    ChatSidebar,
    type ConversationFilter,
} from '@/components/chat/chat-sidebar';
import { ChatThread } from '@/components/chat/chat-thread';
import { currentUserId, initialConversations } from './mock-data';

export default function ChatIndex() {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(initialConversations[0]?.id ?? null);
    const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');
    const [search, setSearch] = useState('');
    const activeConversation = conversations.find(
        (conversation) => conversation.id === activeConversationId,
    );

    function selectConversation(conversationId: string): void {
        setActiveConversationId(conversationId);
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === conversationId
                    ? { ...conversation, unreadCount: 0 }
                    : conversation,
            ),
        );
    }

    function sendMessage(text: string): void {
        if (!activeConversationId) return;

        const timestamp = new Intl.DateTimeFormat('en', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date());

        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeConversationId
                    ? {
                          ...conversation,
                          updatedAt: 'Just now',
                          unreadCount: 0,
                          messages: [
                              ...conversation.messages,
                              {
                                  id: `message-${Date.now()}`,
                                  senderId: currentUserId,
                                  senderName: 'You',
                                  text,
                                  time: timestamp,
                              },
                          ],
                      }
                    : conversation,
            ),
        );
    }

    return (
        <>
            <Head title="Chat" />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 md:p-8">
                <header className="space-y-2">
                    <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-300">
                        One Campus community
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
                    <p className="text-muted-foreground">
                        Stay connected with classmates and campus groups.
                    </p>
                </header>

                <section
                    aria-label="Campus chats"
                    className="bg-card grid h-[min(76vh,820px)] min-h-[560px] flex-1 overflow-hidden rounded-xl border shadow-sm"
                    style={{
                        gridTemplateColumns:
                            'minmax(16rem, 4fr) minmax(0, 6fr)',
                    }}
                >
                    <div className="min-h-0 min-w-0">
                        <ChatSidebar
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            activeFilter={activeFilter}
                            search={search}
                            onFilterChange={setActiveFilter}
                            onSearchChange={setSearch}
                            onSelectConversation={selectConversation}
                        />
                    </div>
                    <div className="min-h-0 min-w-0">
                        <ChatThread
                            conversation={activeConversation}
                            onSend={sendMessage}
                        />
                    </div>
                </section>

                <p className="text-muted-foreground text-center text-xs">
                    Chat preview · Conversations and messages are stored only in
                    this session.
                </p>
            </main>
        </>
    );
}

ChatIndex.layout = {
    breadcrumbs: [{ title: 'Chat', href: '/chat' }],
};
