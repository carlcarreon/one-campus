import { LockKeyhole, Settings2, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ChatConversation } from '@/pages/chat/mock-data';

function SettingRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-right text-sm font-medium">{value}</dd>
        </div>
    );
}

export function ConversationSettingsDialog({
    conversation,
    open,
    onOpenChange,
}: {
    conversation: ChatConversation;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isGroup = conversation.type === 'group';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-amber-300/20 text-amber-800 dark:text-amber-200">
                        <Settings2 className="size-6" aria-hidden="true" />
                    </span>
                    <DialogTitle>Conversation settings</DialogTitle>
                    <DialogDescription>{conversation.name}</DialogDescription>
                </DialogHeader>
                <dl className="bg-muted/20 divide-y rounded-lg border px-4">
                    <SettingRow
                        label="Conversation type"
                        value={isGroup ? 'Group chat' : 'Personal chat'}
                    />
                    {isGroup ? (
                        <>
                            <SettingRow
                                label="Visibility"
                                value={`${conversation.visibility} group`}
                            />
                            <SettingRow
                                label="Members"
                                value={`${conversation.memberCount} people`}
                            />
                        </>
                    ) : (
                        <SettingRow
                            label="Availability"
                            value={
                                conversation.isOnline ? 'Online now' : 'Offline'
                            }
                        />
                    )}
                </dl>
                {isGroup && (
                    <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
                        {conversation.visibility === 'private' ? (
                            <LockKeyhole
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        ) : (
                            <UsersRound
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        )}
                        {conversation.visibility === 'private'
                            ? 'Only invited members can access this group.'
                            : 'This group is open to the campus community.'}
                    </p>
                )}
                <DialogFooter>
                    <Button
                        type="button"
                        className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
