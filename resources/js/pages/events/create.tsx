import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
    CalendarPlus,
    Building2,
    ChevronDown,
    ImagePlus,
    LockKeyhole,
    Search,
    UserRound,
    X,
    Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CampusEvent } from '@/components/event/types';

export type PostedCampusEvent = CampusEvent & {
    visibility: 'public' | 'organization' | 'private';
    organization?: string;
    targetOrganization?: string;
    inviteEmails: string[];
};

type CreateEventDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (event: PostedCampusEvent) => void;
};

const organizations = [
    'Arts & Culture Club',
    'Campus Volunteers',
    'Student Council',
];

const inviteContacts = [
    { name: 'Mika Santos', email: 'mika.santos@onecampus.edu' },
    { name: 'Alex Rivera', email: 'alex.rivera@onecampus.edu' },
    { name: 'Jamie Cruz', email: 'jamie.cruz@onecampus.edu' },
    { name: 'Noah Reyes', email: 'noah.reyes@onecampus.edu' },
    { name: 'Jules Mendoza', email: 'jules.mendoza@onecampus.edu' },
];

type EventImageAttachment = {
    name: string;
    url: string;
};

function formatTime(time: string): string {
    const [hours = '0', minutes = '00'] = time.split(':');

    return new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(2000, 0, 1, Number(hours), Number(minutes)));
}

function calendarTimestamp(date: string, time: string): string {
    return `${date.replaceAll('-', '')}T${time.replaceAll(':', '')}00`;
}

function getFormValue(formData: FormData, name: string): string {
    const value = formData.get(name);

    return typeof value === 'string' ? value : '';
}

export function CreateEventDialog({
    open,
    onOpenChange,
    onCreate,
}: CreateEventDialogProps) {
    const [visibility, setVisibility] = useState<
        'public' | 'organization' | 'private'
    >('public');
    const [organization, setOrganization] = useState('none');
    const [targetOrganization, setTargetOrganization] = useState('');
    const [inviteEmails, setInviteEmails] = useState<string[]>([]);
    const [inviteSearch, setInviteSearch] = useState('');
    const [imageAttachments, setImageAttachments] = useState<
        EventImageAttachment[]
    >([]);
    const [previewAttachment, setPreviewAttachment] =
        useState<EventImageAttachment | null>(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [error, setError] = useState('');
    const filteredInviteContacts = inviteContacts.filter((contact) =>
        `${contact.name} ${contact.email}`
            .toLowerCase()
            .includes(inviteSearch.toLowerCase().trim()),
    );

    function selectImage(event: ChangeEvent<HTMLInputElement>): void {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';

        if (files.length === 0) {
            return;
        }

        const validFiles = files.filter(
            (file) =>
                file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024,
        );
        const hasInvalidFiles = validFiles.length !== files.length;

        setAttachmentError(
            hasInvalidFiles
                ? 'Some files were skipped. Choose images smaller than 5 MB each.'
                : '',
        );

        Promise.all(
            validFiles.map(
                (file) =>
                    new Promise<EventImageAttachment>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            if (typeof reader.result === 'string') {
                                resolve({
                                    name: file.name,
                                    url: reader.result,
                                });
                            } else {
                                reject(new Error('Could not read image'));
                            }
                        };
                        reader.onerror = () =>
                            reject(new Error('Could not read image'));
                        reader.readAsDataURL(file);
                    }),
            ),
        )
            .then((attachments) => {
                setImageAttachments((current) => [...current, ...attachments]);
            })
            .catch(() => {
                setAttachmentError('An image could not be loaded. Try again.');
            });
    }

    function removeImage(indexToRemove: number): void {
        setImageAttachments((current) =>
            current.filter((_, index) => index !== indexToRemove),
        );
        setAttachmentError('');
    }

    function submitEvent(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = getFormValue(formData, 'title').trim();
        const description = getFormValue(formData, 'description').trim();
        const dateKey = getFormValue(formData, 'date');
        const start = getFormValue(formData, 'start');
        const end = getFormValue(formData, 'end');
        const venue = getFormValue(formData, 'venue').trim();

        if (!title || !dateKey || !start || !end || !venue) {
            setError(
                'Add an event name, date, time, and location to continue.',
            );
            return;
        }

        if (end <= start) {
            setError('The end time must be later than the start time.');
            return;
        }

        if (visibility === 'organization' && !targetOrganization) {
            setError('Choose the organization this event is for.');
            return;
        }

        onCreate({
            title,
            description: description || 'More details coming soon.',
            dateKey,
            date: new Intl.DateTimeFormat('en', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }).format(new Date(`${dateKey}T12:00:00`)),
            startTime: formatTime(start),
            endTime: formatTime(end),
            venue,
            calendarStart: calendarTimestamp(dateKey, start),
            calendarEnd: calendarTimestamp(dateKey, end),
            visibility,
            organization: organization === 'none' ? undefined : organization,
            targetOrganization:
                visibility === 'organization' ? targetOrganization : undefined,
            inviteEmails: visibility === 'private' ? inviteEmails : [],
            imageUrl: imageAttachments[0]?.url,
            imageUrls: imageAttachments.map((attachment) => attachment.url),
            imageAlt: imageAttachments.length > 0 ? title : undefined,
        });
        setError('');
        setVisibility('public');
        setOrganization('none');
        setTargetOrganization('');
        setInviteEmails([]);
        setInviteSearch('');
        setImageAttachments([]);
        setAttachmentError('');
        onOpenChange(false);
        event.currentTarget.reset();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <form onSubmit={submitEvent} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-[#641b2e] dark:text-amber-100">
                            Create an event
                        </DialogTitle>
                        <DialogDescription>
                            Share a campus event and choose who can see it. This
                            preview is saved only for this session.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid items-start gap-6 md:grid-cols-2">
                        <div className="min-w-0 space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                                    Event name
                                    <Input
                                        name="title"
                                        placeholder="e.g. Open Mic Night"
                                        autoFocus
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                                    Description
                                    <textarea
                                        name="description"
                                        placeholder="What should people know about this event?"
                                        rows={3}
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                </label>
                                <div className="grid gap-2 sm:col-span-2">
                                    <span className="text-sm font-medium">
                                        Organized by
                                    </span>
                                    <Select
                                        value={organization}
                                        onValueChange={setOrganization}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose an organization (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Just me
                                            </SelectItem>
                                            {organizations.map((name) => (
                                                <SelectItem
                                                    key={name}
                                                    value={name}
                                                >
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <label className="grid gap-2 text-sm font-medium">
                                    Date
                                    <Input name="date" type="date" />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    Location
                                    <Input
                                        name="venue"
                                        placeholder="Building or meeting spot"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    Starts at
                                    <Input name="start" type="time" />
                                </label>
                                <label className="grid gap-2 text-sm font-medium">
                                    Ends at
                                    <Input name="end" type="time" />
                                </label>
                            </div>
                        </div>

                        <div className="min-w-0 space-y-5">
                            <div className="grid gap-2">
                                <span className="text-sm font-medium">
                                    Visibility
                                </span>
                                <Tabs
                                    value={visibility}
                                    onValueChange={(value) =>
                                        setVisibility(
                                            value as
                                                | 'public'
                                                | 'organization'
                                                | 'private',
                                        )
                                    }
                                >
                                    <TabsList className="bg-muted grid h-auto w-full grid-cols-3 gap-1 p-1">
                                        <TabsTrigger
                                            value="public"
                                            className="gap-1 px-1.5 data-[state=active]:bg-amber-300/20 data-[state=active]:text-amber-800 sm:gap-2 sm:px-2 dark:data-[state=active]:text-amber-200"
                                        >
                                            <Globe2 aria-hidden="true" /> Public
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="organization"
                                            className="gap-1 px-1.5 data-[state=active]:bg-amber-300/20 data-[state=active]:text-amber-800 sm:gap-2 sm:px-2 dark:data-[state=active]:text-amber-200"
                                        >
                                            <Building2 aria-hidden="true" /> Org
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="private"
                                            className="gap-1 px-1.5 data-[state=active]:bg-rose-300/15 data-[state=active]:text-rose-800 sm:gap-2 sm:px-2 dark:data-[state=active]:text-rose-200"
                                        >
                                            <LockKeyhole aria-hidden="true" />{' '}
                                            Private
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <p className="text-muted-foreground text-xs">
                                    {visibility === 'public'
                                        ? 'Anyone on campus can discover this event.'
                                        : visibility === 'organization'
                                          ? 'Only members of the selected organization can see this event.'
                                          : 'Only people you invite can see this event.'}
                                </p>
                            </div>

                            {visibility === 'organization' && (
                                <div className="grid gap-2">
                                    <span className="text-sm font-medium">
                                        Visible to organization
                                    </span>
                                    <Select
                                        value={targetOrganization}
                                        onValueChange={setTargetOrganization}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose an organization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {organizations.map((name) => (
                                                <SelectItem
                                                    key={name}
                                                    value={name}
                                                >
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {visibility === 'private' && (
                                <div className="space-y-3 rounded-lg border p-4">
                                    <div className="grid gap-1">
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            <UserRound
                                                className="size-4 text-amber-700 dark:text-amber-300"
                                                aria-hidden="true"
                                            />
                                            Invite people by email
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            Search by name or email and select
                                            everyone you want to invite.
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                <span className="truncate">
                                                    {inviteEmails.length > 0
                                                        ? `${inviteEmails.length} ${inviteEmails.length === 1 ? 'person' : 'people'} selected`
                                                        : 'Select people to invite'}
                                                </span>
                                                <ChevronDown
                                                    className="text-muted-foreground size-4"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="w-[var(--radix-dropdown-menu-trigger-width)] p-2"
                                        >
                                            <div className="relative pb-2">
                                                <Search
                                                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                                    aria-hidden="true"
                                                />
                                                <Input
                                                    value={inviteSearch}
                                                    onChange={(event) =>
                                                        setInviteSearch(
                                                            event.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                    placeholder="Search by name or email"
                                                    aria-label="Search invitees"
                                                    className="pl-9"
                                                />
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredInviteContacts.map(
                                                    (contact) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={contact.email}
                                                            checked={inviteEmails.includes(
                                                                contact.email,
                                                            )}
                                                            onSelect={(event) =>
                                                                event.preventDefault()
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setInviteEmails(
                                                                    (
                                                                        current,
                                                                    ) =>
                                                                        checked
                                                                            ? [
                                                                                  ...current,
                                                                                  contact.email,
                                                                              ]
                                                                            : current.filter(
                                                                                  (
                                                                                      email,
                                                                                  ) =>
                                                                                      email !==
                                                                                      contact.email,
                                                                              ),
                                                                )
                                                            }
                                                            className="items-start py-2 pl-8"
                                                        >
                                                            <span className="grid min-w-0 gap-0.5">
                                                                <span className="truncate font-medium">
                                                                    {
                                                                        contact.name
                                                                    }
                                                                </span>
                                                                <span className="text-muted-foreground truncate text-xs">
                                                                    {
                                                                        contact.email
                                                                    }
                                                                </span>
                                                            </span>
                                                        </DropdownMenuCheckboxItem>
                                                    ),
                                                )}
                                                {filteredInviteContacts.length ===
                                                    0 && (
                                                    <p className="text-muted-foreground p-3 text-sm">
                                                        No people found.
                                                    </p>
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {inviteEmails.length > 0 && (
                                        <div
                                            className="flex flex-wrap gap-2"
                                            aria-live="polite"
                                        >
                                            {inviteEmails.map((email) => {
                                                const contact =
                                                    inviteContacts.find(
                                                        (option) =>
                                                            option.email ===
                                                            email,
                                                    );

                                                return (
                                                    <span
                                                        key={email}
                                                        className="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-100"
                                                    >
                                                        {contact?.name ?? email}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setInviteEmails(
                                                                    (current) =>
                                                                        current.filter(
                                                                            (
                                                                                value,
                                                                            ) =>
                                                                                value !==
                                                                                email,
                                                                        ),
                                                                )
                                                            }
                                                            className="rounded-full p-0.5 hover:bg-black/10"
                                                            aria-label={`Remove ${contact?.name ?? email}`}
                                                        >
                                                            <X
                                                                className="size-3"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="grid gap-1">
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <ImagePlus
                                            className="size-4 text-amber-700 dark:text-amber-300"
                                            aria-hidden="true"
                                        />
                                        Image attachment
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        Add multiple event photos or posters.
                                        Maximum file size: 5 MB per image.
                                    </span>
                                </div>
                                {imageAttachments.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {imageAttachments.map(
                                            (attachment, index) => (
                                                <div
                                                    key={`${attachment.name}-${index}`}
                                                    className="group relative aspect-video overflow-hidden rounded-md border"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewAttachment(
                                                                attachment,
                                                            )
                                                        }
                                                        className="absolute inset-0 size-full cursor-zoom-in"
                                                        aria-label={`Preview attached image ${index + 1}`}
                                                    >
                                                        <img
                                                            src={attachment.url}
                                                            alt=""
                                                            className="size-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    </button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        className="absolute top-2 right-2 z-10 size-7 rounded-full bg-black/65 text-white shadow-sm hover:bg-black/85 hover:text-white"
                                                        onClick={() =>
                                                            removeImage(index)
                                                        }
                                                        aria-label={`Remove ${attachment.name}`}
                                                    >
                                                        <X aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                <label className="border-input hover:bg-muted/50 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-4 text-sm font-medium transition-colors">
                                    <ImagePlus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Add images
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="sr-only"
                                        onChange={selectImage}
                                    />
                                </label>
                                {attachmentError && (
                                    <p
                                        role="alert"
                                        className="text-destructive text-sm"
                                    >
                                        {attachmentError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Dialog
                        open={previewAttachment !== null}
                        onOpenChange={(open) => {
                            if (!open) {
                                setPreviewAttachment(null);
                            }
                        }}
                    >
                        <DialogContent className="max-w-4xl">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Image preview</DialogTitle>
                            </DialogHeader>
                            {previewAttachment && (
                                <img
                                    src={previewAttachment.url}
                                    alt={previewAttachment.name}
                                    className="max-h-[75vh] w-full rounded-md object-contain"
                                />
                            )}
                        </DialogContent>
                    </Dialog>

                    {error && (
                        <p role="alert" className="text-destructive text-sm">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                        >
                            <CalendarPlus aria-hidden="true" /> Create event
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
