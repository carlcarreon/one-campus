import { Search, UsersRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ChatConversation } from '@/pages/chat/mock-data';

export type ConversationFilter = 'all' | 'direct' | 'groups';

export function ChatSidebar({
    conversations,
    activeConversationId,
    activeFilter,
    search,
    onFilterChange,
    onSearchChange,
    onSelectConversation,
}: {
    conversations: ChatConversation[];
    activeConversationId: string | null;
    activeFilter: ConversationFilter;
    search: string;
    onFilterChange: (filter: ConversationFilter) => void;
    onSearchChange: (search: string) => void;
    onSelectConversation: (conversationId: string) => void;
}) {
    const visibleConversations = conversations.filter((conversation) => {
        const matchesFilter =
            activeFilter === 'all' ||
            (activeFilter === 'direct' && conversation.type === 'direct') ||
            (activeFilter === 'groups' && conversation.type === 'group');
        const latestMessage =
            conversation.messages[conversation.messages.length - 1]?.text ?? '';
        const searchText = `${conversation.name} ${conversation.subtitle} ${latestMessage}`;

        return (
            matchesFilter &&
            searchText.toLowerCase().includes(search.toLowerCase())
        );
    });
    const selectedTabStyle = (filter: ConversationFilter) =>
        activeFilter === filter
            ? {
                  backgroundColor: '#641b2e',
                  color: '#fff',
                  boxShadow: 'none',
              }
            : undefined;

    return (
        <aside className="flex h-full min-h-0 w-full flex-col border-r">
            <div className="space-y-4 border-b p-4">
                <div>
                    <h2 className="text-xl font-bold">Conversations</h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Group chats and personal chats
                    </p>
                </div>
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        aria-label="Search conversations"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search conversations"
                        className="pl-9"
                    />
                </div>
                <Tabs
                    value={activeFilter}
                    onValueChange={(value) =>
                        onFilterChange(value as ConversationFilter)
                    }
                >
                    <TabsList
                        aria-label="Filter conversations"
                        className="w-full p-0"
                        style={{ display: 'flex', width: '100%' }}
                    >
                        <TabsTrigger
                            value="all"
                            style={selectedTabStyle('all')}
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="direct"
                            style={selectedTabStyle('direct')}
                        >
                            Direct
                        </TabsTrigger>
                        <TabsTrigger
                            value="groups"
                            style={selectedTabStyle('groups')}
                        >
                            Groups
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {visibleConversations.length > 0 ? (
                    <div className="space-y-1">
                        {visibleConversations.map((conversation) => {
                            const latestMessage =
                                conversation.messages[
                                    conversation.messages.length - 1
                                ];
                            const isActive =
                                conversation.id === activeConversationId;

                            return (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() =>
                                        onSelectConversation(conversation.id)
                                    }
                                    aria-current={isActive ? 'true' : undefined}
                                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${isActive ? 'bg-amber-300/15' : 'hover:bg-muted/70'}`}
                                >
                                    <span className="relative shrink-0">
                                        <Avatar className="size-11">
                                            <AvatarFallback className="bg-amber-300/20 font-semibold text-amber-900 dark:text-amber-200">
                                                {conversation.type ===
                                                'group' ? (
                                                    <UsersRound className="size-5" />
                                                ) : (
                                                    conversation.initials
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conversation.isOnline && (
                                            <span className="border-card absolute right-0 bottom-0 size-3 rounded-full border-2 bg-green-500" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold">
                                                {conversation.name}
                                            </span>
                                            <span className="text-muted-foreground shrink-0 text-[11px]">
                                                {conversation.updatedAt}
                                            </span>
                                        </span>
                                        <span className="mt-1 flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground flex min-w-0 items-center gap-1 truncate text-xs">
                                                {conversation.type ===
                                                    'group' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-4 shrink-0 px-1.5 text-[9px] font-medium text-amber-800 dark:text-amber-300"
                                                    >
                                                        {
                                                            conversation.visibility
                                                        }
                                                    </Badge>
                                                )}
                                                <span className="truncate">
                                                    {latestMessage?.senderId ===
                                                    'you'
                                                        ? 'You: '
                                                        : ''}
                                                    {latestMessage?.text ??
                                                        conversation.subtitle}
                                                </span>
                                            </span>
                                            {conversation.unreadCount > 0 && (
                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#641b2e] text-[10px] font-semibold text-white">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                        No conversations match your search.
                    </p>
                )}
            </div>
        </aside>
    );
}
