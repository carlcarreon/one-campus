import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ImagePlus,
    CalendarDays,
    MessageCircle,
    MoreHorizontal,
    Search,
    Send,
    ThumbsUp,
    X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { sampleEvents } from '@/pages/events/mock-data';
import events from '@/routes/events';

type FeedComment = {
    id: number;
    author: string;
    initials: string;
    text: string;
};

type FeedPost = {
    id: number;
    author: string;
    initials: string;
    role: string;
    time: string;
    text: string;
    image?: string;
    likes: number;
    liked: boolean;
    comments: FeedComment[];
    group?: string;
};

type ChatMessage = {
    id: number;
    text: string;
    sender: 'me' | 'them';
};

const initialPosts: FeedPost[] = [
    {
        id: 1,
        author: 'Mika Santos',
        initials: 'MS',
        role: 'Student · Arts & Culture Club',
        time: '18 min ago',
        text: 'The campus is looking extra beautiful this afternoon 🌿 A little reminder to take a break, get some fresh air, and enjoy the spaces we share.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
        likes: 24,
        liked: false,
        comments: [
            {
                id: 1,
                author: 'Jamie Cruz',
                initials: 'JC',
                text: 'The garden by the library is my favorite spot!',
            },
            {
                id: 2,
                author: 'Noah Reyes',
                initials: 'NR',
                text: 'Needed this reminder today 🌱',
            },
        ],
        group: 'Arts & Culture Club',
    },
    {
        id: 2,
        author: 'One Campus Office',
        initials: 'OC',
        role: 'Campus announcement',
        time: '1 hr ago',
        text: 'The Student Organization Fair is coming up on October 14! Meet campus groups, find your people, and discover something new. We can’t wait to see you there.',
        likes: 42,
        liked: false,
        comments: [
            {
                id: 3,
                author: 'Alex Rivera',
                initials: 'AR',
                text: 'What time does it start?',
            },
        ],
        group: 'One Campus',
    },
    {
        id: 3,
        author: 'Jules Mendoza',
        initials: 'JM',
        role: 'Student · Campus Volunteers',
        time: '3 hrs ago',
        text: 'We had such a great turnout at our volunteer meetup today. Thank you to everyone who came by and signed up for the campus clean-up. There’s still room for more hands! 💛',
        likes: 17,
        liked: false,
        comments: [],
        group: 'Campus Volunteers',
    },
];

function InitialsAvatar({
    initials,
    name,
}: {
    initials: string;
    name: string;
}) {
    return (
        <Avatar className="size-10">
            <AvatarImage alt={name} />
            <AvatarFallback className="bg-amber-300/15 font-semibold text-amber-800 dark:bg-amber-300/15 dark:text-amber-200">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}

export default function FeedIndex() {
    const { url } = usePage();
    const [posts, setPosts] = useState(initialPosts);
    const [draft, setDraft] = useState('');
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
        {},
    );
    const [activeFilter, setActiveFilter] = useState<'For you' | 'Following'>(
        'For you',
    );
    const [activeUserQuery, setActiveUserQuery] = useState('');
    const [isActiveUserSearchOpen, setIsActiveUserSearchOpen] =
        useState(false);
    const [selectedActiveUsers, setSelectedActiveUsers] = useState<FeedPost[]>(
        [],
    );
    const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>(
        {},
    );
    const [chatMessages, setChatMessages] = useState<
        Record<string, ChatMessage[]>
    >({});
    const chatScrollAreas = useRef<Record<string, HTMLDivElement | null>>({});
    const messageInputs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        Object.values(chatScrollAreas.current).forEach((scrollArea) => {
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight;
            }
        });
    }, [chatMessages]);

    function sendMessage(user: FeedPost): void {
        const text = (messageDrafts[user.author] ?? '').trim();

        if (!text) {
            return;
        }

        setChatMessages((currentMessages) => ({
            ...currentMessages,
            [user.author]: [
                ...(currentMessages[user.author] ?? []),
                { id: Date.now(), text, sender: 'me' },
            ],
        }));
        setMessageDrafts((currentDrafts) => ({
            ...currentDrafts,
            [user.author]: '',
        }));
        requestAnimationFrame(() => messageInputs.current[user.author]?.focus());
    }

    function publishPost(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const text = draft.trim();

        if (!text) {
            return;
        }

        setPosts((currentPosts) => [
            {
                id: Date.now(),
                author: 'You',
                initials: 'YO',
                role: 'Campus community',
                time: 'Just now',
                text,
                likes: 0,
                liked: false,
                comments: [],
            },
            ...currentPosts,
        ]);
        setDraft('');
    }

    function toggleLike(postId: number): void {
        setPosts((currentPosts) =>
            currentPosts.map((post) => {
                if (post.id !== postId) {
                    return post;
                }

                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.likes + (post.liked ? -1 : 1),
                };
            }),
        );
    }

    function addComment(
        event: FormEvent<HTMLFormElement>,
        postId: number,
    ): void {
        event.preventDefault();
        const text = (commentDrafts[postId] ?? '').trim();

        if (!text) {
            return;
        }

        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          comments: [
                              ...post.comments,
                              {
                                  id: Date.now(),
                                  author: 'You',
                                  initials: 'YO',
                                  text,
                              },
                          ],
                      }
                    : post,
            ),
        );
        setCommentDrafts((currentDrafts) => ({
            ...currentDrafts,
            [postId]: '',
        }));
    }

    const isOrganizationView = new URL(
        url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).searchParams.get('view') === 'organizations';
    const visiblePosts = isOrganizationView
        ? posts.filter((post) => post.group)
        : activeFilter === 'Following'
          ? posts.filter((post) => post.group)
          : posts;
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const upcomingEvents = sampleEvents
        .filter((event) => event.dateKey >= todayKey)
        .sort((first, second) => first.dateKey.localeCompare(second.dateKey))
        .slice(0, 2);
    const filteredActiveUsers = initialPosts.filter((user) =>
        `${user.author} ${user.role}`
            .toLowerCase()
            .includes(activeUserQuery.trim().toLowerCase()),
    );

    return (
        <>
            <Head title="Feed" />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-8">
                <header className="space-y-2">
                    <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-300">
                        One Campus community
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Campus Feed
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        See what’s happening around campus and share an update.
                    </p>
                </header>
                <div className="grid gap-6 lg:grid-cols-10">
                    <section
                        className="min-w-0 space-y-4 lg:col-span-7"
                        aria-label="Campus posts"
                    >
                        <Card className="gap-4 p-4 sm:p-5">
                            <form onSubmit={publishPost} className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <InitialsAvatar initials="YO" name="You" />
                                    <textarea
                                        value={draft}
                                        onChange={(event) =>
                                            setDraft(event.target.value)
                                        }
                                        placeholder="Share something with your campus..."
                                        aria-label="Write a post"
                                        className="border-input bg-muted/40 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 flex min-h-24 w-full resize-y rounded-xl border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground"
                                        disabled
                                    >
                                        <ImagePlus aria-hidden="true" />
                                        Add photo
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!draft.trim()}
                                        className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                                    >
                                        <Send aria-hidden="true" />
                                        Share post
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        <div className="flex items-center justify-between gap-3 py-1">
                            <h2 className="text-lg font-semibold">
                                Latest posts
                            </h2>
                            <div
                                className="bg-card flex rounded-lg border p-1"
                                role="group"
                                aria-label="Filter feed"
                            >
                                {(['For you', 'Following'] as const).map(
                                    (filter) => (
                                        <button
                                            key={filter}
                                            type="button"
                                            onClick={() =>
                                                setActiveFilter(filter)
                                            }
                                            aria-pressed={
                                                activeFilter === filter
                                            }
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeFilter === filter ? 'bg-[#641b2e] text-white' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {filter}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        {visiblePosts.map((post) => (
                            <Card
                                key={post.id}
                                className="gap-0 overflow-hidden py-0"
                            >
                                <div className="flex items-start gap-3 p-4 sm:p-5">
                                    <InitialsAvatar
                                        initials={post.initials}
                                        name={post.author}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {post.author}
                                                </p>
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {post.role} · {post.time}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="More post options"
                                                disabled
                                            >
                                                <MoreHorizontal aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 px-4 pb-4 sm:px-5">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {post.text}
                                    </p>
                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt="Green campus garden"
                                            className="max-h-[420px] w-full rounded-xl object-cover"
                                        />
                                    )}
                                    {(post.likes > 0 ||
                                        post.comments.length > 0) && (
                                        <div className="text-muted-foreground flex items-center justify-between border-b pb-3 text-xs">
                                            <span>
                                                {post.likes > 0
                                                    ? `👍 ${post.likes} likes`
                                                    : ''}
                                            </span>
                                            <span>
                                                {post.comments.length}{' '}
                                                {post.comments.length === 1
                                                    ? 'comment'
                                                    : 'comments'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => toggleLike(post.id)}
                                            className={
                                                post.liked
                                                    ? 'text-amber-800 dark:text-amber-300'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            <ThumbsUp aria-hidden="true" />
                                            {post.liked ? 'Liked' : 'Like'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        `comment-${post.id}`,
                                                    )
                                                    ?.focus()
                                            }
                                            className="text-muted-foreground"
                                        >
                                            <MessageCircle aria-hidden="true" />
                                            Comment
                                        </Button>
                                    </div>
                                    {post.comments.length > 0 && (
                                        <div className="space-y-3 border-t pt-4">
                                            {post.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="flex items-start gap-2.5"
                                                >
                                                    <Avatar className="size-8">
                                                        <AvatarFallback className="bg-muted text-xs font-semibold">
                                                            {comment.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted/60 min-w-0 flex-1 rounded-xl px-3 py-2">
                                                        <p className="text-xs font-semibold">
                                                            {comment.author}
                                                        </p>
                                                        <p className="text-sm">
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <form
                                        onSubmit={(event) =>
                                            addComment(event, post.id)
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <InitialsAvatar
                                            initials="YO"
                                            name="You"
                                        />
                                        <textarea
                                            id={`comment-${post.id}`}
                                            value={commentDrafts[post.id] ?? ''}
                                            onChange={(event) =>
                                                setCommentDrafts((drafts) => ({
                                                    ...drafts,
                                                    [post.id]:
                                                        event.target.value,
                                                }))
                                            }
                                            placeholder="Write a comment..."
                                            aria-label={`Comment on ${post.author}'s post`}
                                            rows={1}
                                            className="border-input bg-muted/40 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 flex min-h-10 w-full resize-none rounded-full border px-4 py-2.5 text-sm shadow-xs outline-none focus-visible:ring-2"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            variant="ghost"
                                            aria-label="Send comment"
                                            disabled={
                                                !(
                                                    commentDrafts[post.id] ?? ''
                                                ).trim()
                                            }
                                        >
                                            <Send aria-hidden="true" />
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        ))}
                    </section>

                    <aside
                        className="min-w-0 lg:col-span-3"
                        aria-label="Upcoming events"
                    >
                        <Card className="gap-4 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                    <CalendarDays
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                    <h2 className="font-semibold">
                                        Upcoming events
                                    </h2>
                                </div>
                                <a
                                    href={events.index.url()}
                                    className="shrink-0 text-sm font-semibold text-amber-800 hover:underline dark:text-amber-300"
                                >
                                    View all
                                </a>
                            </div>
                            <div className="grid gap-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={`${event.dateKey}-${event.title}`}
                                        className="bg-card rounded-lg border p-3 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/70 hover:bg-amber-300/10 hover:shadow-md"
                                    >
                                        <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-300">
                                            {event.date} · {event.startTime}
                                        </p>
                                        <p className="mt-1 font-medium">
                                            {event.title}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {event.venue}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="mt-6 gap-2 overflow-hidden p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">
                                        Messages
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        {initialPosts.length} conversations
                                    </p>
                                </div>
                                <Dialog
                                    open={isActiveUserSearchOpen}
                                    onOpenChange={(open) => {
                                        setIsActiveUserSearchOpen(open);
                                        if (!open) {
                                            setActiveUserQuery('');
                                        }
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Search messages"
                                        >
                                            <Search aria-hidden="true" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                        showCloseButton={false}
                                        className="gap-4 overflow-hidden rounded-3xl p-4 shadow-2xl sm:max-w-md"
                                    >
                                        <DialogTitle className="sr-only">
                                            Search messages
                                        </DialogTitle>
                                        <Input
                                            autoFocus
                                            value={activeUserQuery}
                                            onChange={(event) =>
                                                setActiveUserQuery(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Search messages..."
                                            aria-label="Search messages"
                                            className="rounded-full"
                                        />
                                        <div className="grid gap-3">
                                            {filteredActiveUsers.map((user) => (
                                                <button
                                                    type="button"
                                                    key={user.author}
                                                    className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
                                                    onClick={() => {
                                                        setSelectedActiveUsers((currentUsers) =>
                                                            currentUsers.some(
                                                                (currentUser) =>
                                                                    currentUser.author ===
                                                                    user.author,
                                                            )
                                                                ? currentUsers
                                                                : [...currentUsers, user],
                                                        );
                                                        setIsActiveUserSearchOpen(false);
                                                    }}
                                                >
                                                    <InitialsAvatar
                                                        initials={user.initials}
                                                        name={user.author}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="flex items-center justify-between gap-3 text-sm font-medium">
                                                            {user.author}
                                                            <span className="text-muted-foreground shrink-0 text-xs font-normal">
                                                                Active 3m ago
                                                            </span>
                                                        </p>
                                                        <p className="text-muted-foreground max-w-full truncate text-xs">
                                                            {user.role}
                                                            {user.group &&
                                                                !user.role.includes(user.group) &&
                                                                ` · ${user.group}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                            {filteredActiveUsers.length === 0 && (
                                                <p className="text-muted-foreground text-sm">
                                                    No messages found.
                                                </p>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="grid gap-3">
                                {initialPosts.map((user) => (
                                    <button
                                        type="button"
                                        key={user.author}
                                        className="hover:bg-muted flex min-w-0 w-full items-center gap-3 overflow-hidden rounded-lg p-2 text-left"
                                        onClick={() =>
                                            setSelectedActiveUsers((currentUsers) =>
                                                currentUsers.some(
                                                    (currentUser) =>
                                                        currentUser.author ===
                                                        user.author,
                                                )
                                                    ? currentUsers
                                                    : [...currentUsers, user],
                                            )
                                        }
                                    >
                                        <div className="relative">
                                            <InitialsAvatar
                                                initials={user.initials}
                                                name={user.author}
                                            />
                                            <span className="border-card bg-emerald-500 absolute right-0 bottom-0 size-3 rounded-full border-2" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="max-w-full truncate text-sm font-medium">
                                                {user.author}
                                            </p>
                                            <p className="text-muted-foreground max-w-full truncate text-xs">
                                                {user.role}
                                                {user.group &&
                                                    !user.role.includes(user.group) &&
                                                    ` · ${user.group}`}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </aside>
                </div>
            </main>
            {selectedActiveUsers.map((selectedActiveUser, index) => (
                <Card
                    key={selectedActiveUser.author}
                    className="bg-background fixed bottom-20 z-50 w-[min(20rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
                    style={{ right: `${1 + index * 21}rem` }}
                >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {selectedActiveUser.author}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Active 3m ago
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Close chat"
                            onClick={() =>
                                setSelectedActiveUsers((currentUsers) =>
                                    currentUsers.filter(
                                        (currentUser) =>
                                            currentUser.author !==
                                            selectedActiveUser.author,
                                    ),
                                )
                            }
                        >
                            <X aria-hidden="true" />
                        </Button>
                    </div>
                    <div className="p-4">
                        <div
                            ref={(scrollArea) => {
                                chatScrollAreas.current[
                                    selectedActiveUser.author
                                ] = scrollArea;
                            }}
                            className="mb-4 h-52 space-y-2 overflow-y-auto"
                        >
                            {(chatMessages[selectedActiveUser.author] ?? []).length ===
                            0 ? (
                                <div className="bg-muted text-muted-foreground rounded-xl px-3 py-2 text-sm">
                                    Start a conversation with{' '}
                                    {selectedActiveUser.author}.
                                </div>
                            ) : (
                                chatMessages[selectedActiveUser.author].map(
                                    (message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <p
                                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                {message.text}
                                            </p>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                ref={(input) => {
                                    messageInputs.current[
                                        selectedActiveUser.author
                                    ] = input;
                                }}
                                value={messageDrafts[selectedActiveUser.author] ?? ''}
                                onChange={(event) =>
                                    setMessageDrafts((currentDrafts) => ({
                                        ...currentDrafts,
                                        [selectedActiveUser.author]:
                                            event.target.value,
                                    }))
                                }
                                placeholder="Write a message..."
                                aria-label="Write a message"
                                className="rounded-full"
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        sendMessage(selectedActiveUser);
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                size="icon"
                                aria-label="Send message"
                                disabled={
                                    !(messageDrafts[selectedActiveUser.author] ?? '').trim()
                                }
                                onClick={() => sendMessage(selectedActiveUser)}
                            >
                                <Send aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </>
    );
}

FeedIndex.layout = {
    breadcrumbs: [{ title: 'Feed', href: '/feed' }],
};
