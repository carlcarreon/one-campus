import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage } from '@/pages/chat/mock-data';

export function MessageBubble({
    message,
    isOwnMessage,
    showSender,
}: {
    message: ChatMessage;
    isOwnMessage: boolean;
    showSender: boolean;
}) {
    const initials = message.senderName
        .split(' ')
        .map((namePart) => namePart[0])
        .slice(0, 2)
        .join('');

    return (
        <div
            className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
            {!isOwnMessage && (
                <Avatar className="mb-5 size-8">
                    <AvatarFallback className="bg-amber-300/20 text-xs font-semibold text-amber-900 dark:text-amber-200">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            )}
            <div
                className={`flex max-w-[82%] flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}
            >
                {showSender && !isOwnMessage && (
                    <span className="px-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                        {message.senderName}
                    </span>
                )}
                <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwnMessage ? 'rounded-br-md bg-[#641b2e] text-white' : 'bg-muted text-foreground rounded-bl-md'}`}
                >
                    {message.text}
                </div>
                <time className="text-muted-foreground px-1 text-[11px]">
                    {message.time}
                </time>
            </div>
        </div>
    );
}
