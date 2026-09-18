import { useState, type FormEvent } from 'react';
import { LockKeyhole, Send, Settings2, UsersRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatConversation, ChatMessage } from '@/pages/chat/mock-data';
import { ConversationSettingsDialog } from './conversation-settings-dialog';
import { MessageBubble } from './message-bubble';

export function ChatThread({
    conversation,
    onSend,
}: {
    conversation: ChatConversation | undefined;
    onSend: (text: string) => void;
}) {
    const [draft, setDraft] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    function sendMessage(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const message = draft.trim();

        if (!message) return;

        onSend(message);
        setDraft('');
    }

    if (!conversation) {
        return (
            <section className="hidden min-w-0 flex-1 items-center justify-center md:flex">
                <div className="text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-900 dark:text-amber-200">
                        <Send className="size-6" />
                    </span>
                    <h2 className="mt-4 font-semibold">Your messages</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Choose a conversation to get started.
                    </p>
                </div>
            </section>
        );
    }

    const isGroup = conversation.type === 'group';

    return (
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex items-center gap-3 border-b px-4 py-3">
                <Avatar className="size-10">
                    <AvatarFallback className="bg-amber-300/20 font-semibold text-amber-900 dark:text-amber-200">
                        {isGroup ? (
                            <UsersRound className="size-5" />
                        ) : (
                            conversation.initials
                        )}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold">
                        {conversation.name}
                    </h2>
                    <p className="text-muted-foreground truncate text-xs">
                        {isGroup
                            ? `${conversation.memberCount} members`
                            : conversation.isOnline
                              ? 'Online now'
                              : conversation.subtitle}
                    </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                    {isGroup && (
                        <Badge
                            variant="outline"
                            className="text-amber-800 capitalize dark:text-amber-300"
                        >
                            {conversation.visibility === 'private' && (
                                <LockKeyhole aria-hidden="true" />
                            )}
                            {conversation.visibility} group
                        </Badge>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label={`Settings for ${conversation.name}`}
                        title="Conversation settings"
                    >
                        <Settings2 aria-hidden="true" />
                    </Button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end gap-4">
                    <div className="text-muted-foreground py-3 text-center text-[11px]">
                        {isGroup
                            ? `${conversation.name} · ${conversation.visibility} campus group`
                            : `This is the beginning of your conversation with ${conversation.name}.`}
                    </div>
                    {conversation.messages.map((message: ChatMessage) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwnMessage={message.senderId === 'you'}
                            showSender={isGroup}
                        />
                    ))}
                </div>
            </div>

            <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 border-t p-3 sm:p-4"
            >
                <Input
                    aria-label="Write a message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Message ${isGroup ? 'the group' : conversation.name}...`}
                    autoComplete="off"
                />
                <Button
                    type="submit"
                    disabled={!draft.trim()}
                    className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                    aria-label="Send message"
                >
                    <Send aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Send</span>
                </Button>
            </form>
            <ConversationSettingsDialog
                conversation={conversation}
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
            />
        </section>
    );
}
