
import { useEffect, useState, type FormEvent } from 'react';
import {
    Check,
    Globe,
    LoaderCircle,
    LockKeyhole,
    Plus,
    Search,
    UsersRound,
    X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type {
    ApiChatConversation,
    ApiChatMember,
    ConversationVisibility,
} from '@/types/chat';

type MembersResponse = {
    data: ApiChatMember[];
};

type CreateGroupResponse = {
    data: ApiChatConversation;
};

type CreateGroupDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (conversation: ApiChatConversation) => void;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getCsrfToken(): string | undefined {
    return document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    )?.content;
}

export function CreateGroupDialog({
    open,
    onOpenChange,
    onCreated,
}: CreateGroupDialogProps) {
    const [name, setName] = useState('');
    const [visibility, setVisibility] =
        useState<ConversationVisibility>('public');

    const [search, setSearch] = useState('');
    const [members, setMembers] = useState<ApiChatMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<
        Map<string, ApiChatMember>
    >(new Map());

    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search users whenever the search input changes.
    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();

        async function searchMembers() {
            setIsLoadingMembers(true);

            try {
                const params = new URLSearchParams();

                if (search.trim()) {
                    params.set('search', search.trim());
                }

                const response = await fetch(
                    `/chat/members?${params.toString()}`,
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
                    throw new Error('Unable to load members.');
                }

                const result: MembersResponse = await response.json();

                setMembers(result.data);
            } catch (requestError) {
                if (
                    requestError instanceof Error &&
                    requestError.name === 'AbortError'
                ) {
                    return;
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to search members.',
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingMembers(false);
                }
            }
        }

        searchMembers();

        return () => controller.abort();
    }, [open, search]);

    // Reset the form whenever the dialog closes.
    useEffect(() => {
        if (open) {
            return;
        }

        setName('');
        setVisibility('public');
        setSearch('');
        setMembers([]);
        setSelectedMembers(new Map());
        setError(null);
        setIsCreating(false);
    }, [open]);

    function toggleMember(member: ApiChatMember) {
        setSelectedMembers((previous) => {
            const updated = new Map(previous);

            if (updated.has(member.id)) {
                updated.delete(member.id);
            } else {
                updated.set(member.id, member);
            }

            return updated;
        });
    }

    async function handleCreateGroup(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (name.trim().length < 3) {
            setError('Group name must be at least 3 characters.');
            return;
        }

        if (isCreating) {
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const csrfToken = getCsrfToken();

            const response = await fetch('/chat/groups', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken
                        ? { 'X-CSRF-TOKEN': csrfToken }
                        : {}),
                },
                body: JSON.stringify({
                    name: name.trim(),
                    visibility,
                    member_ids: Array.from(selectedMembers.keys()),
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                const validationMessage = result?.errors
                    ? Object.values(result.errors)
                          .flat()
                          .join(' ')
                    : null;

                throw new Error(
                    validationMessage ??
                        result?.message ??
                        'Failed to create group.',
                );
            }

            const createdConversation =
                (result as CreateGroupResponse).data;

            onCreated(createdConversation);
            onOpenChange(false);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Something went wrong while creating the group.',
            );
        } finally {
            setIsCreating(false);
        }
    }

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isCreating) {
                    onOpenChange(false);
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-group-title"
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
            >
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2
                            id="create-group-title"
                            className="text-lg font-semibold"
                        >
                            Create a group
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Start a conversation with multiple members.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isCreating}
                        onClick={() => onOpenChange(false)}
                        aria-label="Close dialog"
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <form
                    onSubmit={handleCreateGroup}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 space-y-5 overflow-y-auto p-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="group-name"
                                className="text-sm font-medium"
                            >
                                Group name
                            </label>

                            <Input
                                id="group-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Development Team"
                                maxLength={100}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Group visibility
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibility('public')
                                    }
                                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                                        visibility === 'public'
                                            ? 'border-[#641b2e] bg-[#641b2e]/10'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <Globe className="mt-0.5 size-5 shrink-0 text-[#641b2e]" />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold">
                                            Public
                                        </span>
                                        <span className="text-muted-foreground mt-1 block text-xs">
                                            Discoverable by other members.
                                        </span>
                                    </span>

                                    {visibility === 'public' && (
                                        <Check className="size-4 shrink-0 text-[#641b2e]" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibility('private')
                                    }
                                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                                        visibility === 'private'
                                            ? 'border-[#641b2e] bg-[#641b2e]/10'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#641b2e]" />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold">
                                            Private
                                        </span>
                                        <span className="text-muted-foreground mt-1 block text-xs">
                                            Only added members can access it.
                                        </span>
                                    </span>

                                    {visibility === 'private' && (
                                        <Check className="size-4 shrink-0 text-[#641b2e]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium">
                                        Add members
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Select people to add to this group.
                                    </p>
                                </div>

                                <span className="rounded-full bg-[#641b2e]/10 px-2.5 py-1 text-xs font-semibold text-[#641b2e]">
                                    {selectedMembers.size} selected
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search members..."
                                    className="pl-9"
                                />
                            </div>

                            {selectedMembers.size > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(
                                        selectedMembers.values(),
                                    ).map((member) => (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() =>
                                                toggleMember(member)
                                            }
                                            className="flex items-center gap-1.5 rounded-full bg-[#641b2e]/10 py-1 pr-2 pl-1 text-xs font-medium text-[#641b2e]"
                                        >
                                            <Avatar className="size-5">
                                                <AvatarFallback className="text-[9px]">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            {member.name}

                                            <X className="size-3" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="max-h-56 overflow-y-auto rounded-lg border">
                                {isLoadingMembers ? (
                                    <div className="text-muted-foreground flex items-center justify-center gap-2 p-6 text-sm">
                                        <LoaderCircle className="size-4 animate-spin" />
                                        Searching members...
                                    </div>
                                ) : members.length > 0 ? (
                                    <div className="divide-y">
                                        {members.map((member) => {
                                            const selected =
                                                selectedMembers.has(
                                                    member.id,
                                                );

                                            return (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleMember(member)
                                                    }
                                                    className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/70"
                                                >
                                                    <Avatar className="size-9">
                                                        <AvatarFallback className="bg-amber-300/20 text-xs font-semibold text-amber-900 dark:text-amber-200">
                                                            {getInitials(
                                                                member.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                                        {member.name}
                                                    </span>

                                                    <span
                                                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                                            selected
                                                                ? 'border-[#641b2e] bg-[#641b2e] text-white'
                                                                : 'border-muted-foreground/40'
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <Check className="size-3" />
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground p-6 text-center text-sm">
                                        No members found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                            >
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 border-t p-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isCreating}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isCreating || name.trim().length < 3}
                            className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                        >
                            {isCreating ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="size-4" />
                                    Create group
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
