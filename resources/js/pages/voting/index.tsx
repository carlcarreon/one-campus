import { useEffect, useState, type FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Globe2,
    LockKeyhole,
    Plus,
    Vote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BallotCard } from '@/components/voting/ballot-card';
import { RoomCard } from '@/components/voting/room-card';
import { SubmittedBallotDialog } from '@/components/voting/submitted-ballot';
import {
    CreateBallotDialog,
    CreateRoomDialog,
    type PositionDraft,
} from './create';
import JoinWithCodeDialog from './join-with-code';
import {
    initialRooms,
    type Ballot,
    type RoomVisibility,
    type VotingRoom,
} from './mock-data';

function ballotSelectionKey(roomId: string, positionId: string): string {
    return `${roomId}:${positionId}`;
}

export default function VotingIndex() {
    const [rooms, setRooms] = useState(initialRooms);
    const [activeRoomSlug, setActiveRoomSlug] = useState<string | null>(() =>
        typeof window === 'undefined'
            ? null
            : new URLSearchParams(window.location.search).get('room'),
    );
    const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);
    const [ballotSelections, setBallotSelections] = useState<
        Record<string, string>
    >({});
    const [submittedBallots, setSubmittedBallots] = useState<
        Record<string, boolean>
    >({});
    const [isSubmittedBallotDialogOpen, setIsSubmittedBallotDialogOpen] =
        useState(false);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
    const [isCreateBallotOpen, setIsCreateBallotOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [formError, setFormError] = useState('');
    const [roomVisibility, setRoomVisibility] =
        useState<RoomVisibility>('public');
    const [newRoomInviteCode, setNewRoomInviteCode] = useState<string | null>(
        null,
    );
    const [positionDrafts, setPositionDrafts] = useState<PositionDraft[]>([
        { id: 1, title: '', candidates: '' },
    ]);

    useEffect(() => {
        function syncRoomFromUrl(): void {
            setActiveRoomSlug(
                new URLSearchParams(window.location.search).get('room'),
            );
        }
        window.addEventListener('popstate', syncRoomFromUrl);
        return () => window.removeEventListener('popstate', syncRoomFromUrl);
    }, []);

    const activeRoom = rooms.find(
        (room) =>
            room.slug === activeRoomSlug &&
            (room.visibility === 'public' ||
                room.joined ||
                joinedRoomIds.includes(room.id)),
    );
    const publicRooms = rooms.filter((room) => room.visibility === 'public');
    const availablePrivateRooms = rooms.filter(
        (room) =>
            room.visibility === 'private' &&
            (room.joined || joinedRoomIds.includes(room.id)),
    );

    function navigateToRoom(slug: string | null): void {
        const url = new URL(window.location.href);
        if (slug) url.searchParams.set('room', slug);
        else url.searchParams.delete('room');
        window.history.pushState(
            {},
            '',
            `${url.pathname}${url.search}${url.hash}`,
        );
        setActiveRoomSlug(slug);
        setIsSubmittedBallotDialogOpen(false);
        setNewRoomInviteCode(null);
    }

    function submitBallot(roomId: string): void {
        const room = rooms.find((candidate) => candidate.id === roomId);
        const ballot = room?.ballot;
        if (!ballot || ballot.status !== 'open' || submittedBallots[ballot.id])
            return;

        const selections = ballot.positions.map((position) => ({
            positionId: position.id,
            candidateId: ballotSelections[`${roomId}:${position.id}`],
        }));
        if (selections.some((selection) => !selection.candidateId)) return;

        setRooms((current) =>
            current.map((currentRoom) =>
                currentRoom.id !== roomId || !currentRoom.ballot
                    ? currentRoom
                    : {
                          ...currentRoom,
                          ballot: {
                              ...currentRoom.ballot,
                              positions: currentRoom.ballot.positions.map(
                                  (position) => {
                                      const selection = selections.find(
                                          (item) =>
                                              item.positionId === position.id,
                                      );
                                      return {
                                          ...position,
                                          candidates: position.candidates.map(
                                              (candidate) =>
                                                  candidate.id ===
                                                  selection?.candidateId
                                                      ? {
                                                            ...candidate,
                                                            votes:
                                                                candidate.votes +
                                                                1,
                                                        }
                                                      : candidate,
                                          ),
                                      };
                                  },
                              ),
                          },
                      },
            ),
        );
        setSubmittedBallots((current) => ({ ...current, [ballot.id]: true }));
    }

    function joinRoom(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const room = rooms.find(
            (candidate) =>
                candidate.visibility === 'private' &&
                candidate.inviteCode === inviteCode.trim().toUpperCase(),
        );
        if (!room) {
            setInviteError(
                'That invite code is not valid. Check the code and try again.',
            );
            return;
        }
        setJoinedRoomIds((current) =>
            current.includes(room.id) ? current : [...current, room.id],
        );
        setInviteError('');
        setInviteCode('');
        setIsJoinRoomOpen(false);
        navigateToRoom(room.slug);
    }

    function createRoom(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const read = (name: string): string => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };
        const organization = read('organization');
        const name = read('roomName');
        const description = read('roomDescription');
        const visibility = roomVisibility;
        if (!organization || !name) {
            setFormError('Enter an organization and room name.');
            return;
        }

        const id = `room-${Date.now()}`;
        const baseSlug = `${organization}-${name}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const slug = rooms.some((room) => room.slug === baseSlug)
            ? `${baseSlug}-${Date.now().toString().slice(-4)}`
            : baseSlug;
        const code =
            visibility === 'private'
                ? `CAMPUS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
                : undefined;
        const room: VotingRoom = {
            id,
            slug,
            organization,
            name,
            description: description || `${name} room`,
            visibility,
            inviteCode: code,
            joined: true,
        };
        setRooms((current) => [...current, room]);
        setJoinedRoomIds((current) => [...current, id]);
        setFormError('');
        setIsCreateRoomOpen(false);
        navigateToRoom(slug);
        setNewRoomInviteCode(code ?? null);
        setRoomVisibility('public');
        event.currentTarget.reset();
    }

    function createBallot(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (!activeRoom) return;
        const data = new FormData(event.currentTarget);
        const read = (name: string): string => {
            const value = data.get(name);
            return typeof value === 'string' ? value.trim() : '';
        };
        const title = read('ballotTitle');
        const description = read('ballotDescription');
        const positions = positionDrafts.map((position, index) => ({
            id: `position-${Date.now()}-${index}`,
            title: position.title.trim(),
            candidates: position.candidates
                .split('\n')
                .map((candidate) => candidate.trim())
                .filter(Boolean),
        }));

        if (
            !title ||
            positions.length === 0 ||
            positions.some(
                (position) => !position.title || position.candidates.length < 2,
            )
        ) {
            setFormError(
                'Enter a ballot title and at least two candidates for every position.',
            );
            return;
        }

        const ballotId = `ballot-${Date.now()}`;
        const ballot: Ballot = {
            id: ballotId,
            title,
            description,
            closesAt: 'Closes in 7 days',
            status: 'open',
            positions: positions.map((position) => ({
                id: position.id,
                title: position.title,
                candidates: position.candidates.map((name, index) => ({
                    id: `${position.id}-candidate-${index}`,
                    name,
                    votes: 0,
                })),
            })),
        };
        setRooms((current) =>
            current.map((room) =>
                room.id === activeRoom.id ? { ...room, ballot } : room,
            ),
        );
        setBallotSelections((current) => {
            const next = { ...current };
            for (const position of ballot.positions)
                delete next[`${activeRoom.id}:${position.id}`];
            return next;
        });
        setFormError('');
        setPositionDrafts([{ id: Date.now(), title: '', candidates: '' }]);
        setIsCreateBallotOpen(false);
        event.currentTarget.reset();
    }

    return (
        <>
            <Head
                title={activeRoom ? `${activeRoom.name} · Ballot` : 'Voting'}
            />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-300">
                            Your voice matters
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Campus Voting
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            {activeRoom
                                ? 'Select a candidate for each position and submit one complete ballot.'
                                : 'Find a public voting room or join a private room with an invite code.'}
                        </p>
                    </div>
                    {activeRoom ? null : (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setFormError('');
                                    setRoomVisibility('public');
                                    setIsCreateRoomOpen(true);
                                }}
                            >
                                <Plus aria-hidden="true" /> Create room
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setInviteError('');
                                    setIsJoinRoomOpen(true);
                                }}
                                className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                            >
                                <LockKeyhole aria-hidden="true" /> Join with
                                code
                            </Button>
                        </div>
                    )}
                </header>

                {activeRoom ? (
                    <section className="space-y-5" aria-labelledby="room-title">
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigateToRoom(null)}
                                className="text-muted-foreground mb-2 -ml-3"
                            >
                                <ArrowLeft aria-hidden="true" /> All rooms
                            </Button>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                        {activeRoom.organization}
                                    </p>
                                    <h2
                                        id="room-title"
                                        className="text-2xl font-bold"
                                    >
                                        {activeRoom.name}
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {activeRoom.description}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        activeRoom.visibility === 'public'
                                            ? 'border-amber-500/40 text-amber-800 dark:text-amber-300'
                                            : 'border-[#641b2e]/30 text-[#641b2e] dark:border-rose-300/30 dark:text-rose-200'
                                    }
                                >
                                    {activeRoom.visibility === 'public' ? (
                                        <Globe2 aria-hidden="true" />
                                    ) : (
                                        <LockKeyhole aria-hidden="true" />
                                    )}
                                    {activeRoom.visibility === 'public'
                                        ? 'Public room'
                                        : 'Private room'}
                                </Badge>
                            </div>
                            {newRoomInviteCode && (
                                <Card className="mt-4 flex-row flex-wrap items-center justify-between gap-3 border-amber-500/40 bg-amber-300/10 p-4">
                                    <p className="text-sm">
                                        Share this invite code to let others
                                        join the private room:
                                    </p>
                                    <code className="bg-background rounded px-3 py-1.5 font-mono font-semibold text-amber-800 dark:text-amber-200">
                                        {newRoomInviteCode}
                                    </code>
                                </Card>
                            )}
                            {activeRoom.visibility === 'private' &&
                                activeRoom.inviteCode &&
                                !newRoomInviteCode && (
                                    <p className="text-muted-foreground mt-3 text-xs">
                                        Room invite code:{' '}
                                        <span className="font-mono font-semibold text-amber-700 dark:text-amber-300">
                                            {activeRoom.inviteCode}
                                        </span>
                                    </p>
                                )}
                        </div>
                        {activeRoom.ballot ? (
                            submittedBallots[activeRoom.ballot.id] ? (
                                <Card
                                    role="status"
                                    className="items-center gap-4 p-8 text-center"
                                >
                                    <span className="flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                        <Check
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Ballot submitted
                                        </h3>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Your vote has been recorded. You can
                                            return to the room list or review
                                            your ballot.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigateToRoom(null)}
                                        >
                                            <ArrowLeft aria-hidden="true" /> Go
                                            back
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                setIsSubmittedBallotDialogOpen(
                                                    true,
                                                )
                                            }
                                            className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                                        >
                                            View ballot
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <BallotCard
                                    room={activeRoom}
                                    ballot={activeRoom.ballot}
                                    selections={ballotSelections}
                                    hasSubmitted={Boolean(
                                        submittedBallots[activeRoom.ballot.id],
                                    )}
                                    onSelect={(positionId, candidateId) =>
                                        setBallotSelections((current) => ({
                                            ...current,
                                            [ballotSelectionKey(
                                                activeRoom.id,
                                                positionId,
                                            )]: candidateId,
                                        }))
                                    }
                                    onSubmit={() => submitBallot(activeRoom.id)}
                                />
                            )
                        ) : (
                            <Card className="items-center gap-3 border-dashed p-8 text-center">
                                <Vote
                                    className="text-muted-foreground size-8"
                                    aria-hidden="true"
                                />
                                <div>
                                    <h3 className="font-semibold">
                                        No ballot in this room yet
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Create one ballot with positions and
                                        candidates for room members to vote on.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setFormError('');
                                        setPositionDrafts([
                                            {
                                                id: Date.now(),
                                                title: '',
                                                candidates: '',
                                            },
                                        ]);
                                        setIsCreateBallotOpen(true);
                                    }}
                                    className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                                >
                                    <Plus aria-hidden="true" /> Create ballot
                                </Button>
                            </Card>
                        )}
                    </section>
                ) : (
                    <>
                        <section
                            className="space-y-5"
                            aria-labelledby="public-rooms-heading"
                        >
                            <div>
                                <h2
                                    id="public-rooms-heading"
                                    className="text-xl font-semibold"
                                >
                                    Public rooms
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Anyone can find and enter these rooms.
                                </p>
                            </div>
                            {publicRooms.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {publicRooms.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            onOpen={() =>
                                                navigateToRoom(room.slug)
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Card className="text-muted-foreground border-dashed p-6 text-center text-sm">
                                    No public rooms yet. Create a room to get
                                    started.
                                </Card>
                            )}
                        </section>
                        {availablePrivateRooms.length > 0 && (
                            <section
                                className="space-y-3"
                                aria-labelledby="your-private-rooms-heading"
                            >
                                <h2
                                    id="your-private-rooms-heading"
                                    className="text-xl font-semibold"
                                >
                                    Your private rooms
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {availablePrivateRooms.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            isPrivate
                                            onOpen={() =>
                                                navigateToRoom(room.slug)
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                <p className="text-muted-foreground text-center text-xs">
                    Voting preview · Rooms, ballots, invite codes, and votes are
                    stored only in this session.
                </p>
            </main>

            <SubmittedBallotDialog
                open={isSubmittedBallotDialogOpen}
                onOpenChange={setIsSubmittedBallotDialogOpen}
                ballot={activeRoom?.ballot}
                roomId={activeRoom?.id}
                selections={ballotSelections}
            />

            <CreateRoomDialog
                open={isCreateRoomOpen}
                onOpenChange={setIsCreateRoomOpen}
                onSubmit={createRoom}
                formError={formError}
                visibility={roomVisibility}
                onVisibilityChange={setRoomVisibility}
            />
            <JoinWithCodeDialog
                open={isJoinRoomOpen}
                onOpenChange={setIsJoinRoomOpen}
                onSubmit={joinRoom}
                inviteCode={inviteCode}
                onInviteCodeChange={setInviteCode}
                inviteError={inviteError}
            />
            <CreateBallotDialog
                open={isCreateBallotOpen}
                onOpenChange={setIsCreateBallotOpen}
                onSubmit={createBallot}
                formError={formError}
                roomName={activeRoom?.name}
                visibility={activeRoom?.visibility}
                positionDrafts={positionDrafts}
                onPositionDraftsChange={setPositionDrafts}
            />
        </>
    );
}

VotingIndex.layout = {
    breadcrumbs: [{ title: 'Voting', href: '/voting' }],
};
