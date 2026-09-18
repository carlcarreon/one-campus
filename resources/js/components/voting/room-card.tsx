import { ArrowRight, DoorOpen, LockKeyhole } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { VotingRoom } from './types';

export function RoomCard({
    room,
    isPrivate = false,
    onOpen,
}: {
    room: VotingRoom;
    isPrivate?: boolean;
    onOpen: () => void;
}) {
    const ballotSummary = room.ballot
        ? `${room.ballot.status === 'open' ? '1 open' : 'Completed'} ballot · ${room.ballot.positions.length} positions`
        : 'No ballot yet';

    return (
        <button type="button" onClick={onOpen} className="group text-left">
            <Card
                className={`h-full flex-row items-center justify-between gap-4 p-4 transition ${isPrivate ? 'hover:border-amber-400/70 hover:shadow-md' : 'duration-200 group-hover:-translate-y-0.5 group-hover:border-amber-400/70 group-hover:shadow-md'}`}
            >
                <div className="flex min-w-0 items-start gap-3">
                    {!isPrivate && (
                        <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-amber-300/20 group-hover:text-amber-800 dark:group-hover:text-amber-200">
                            <DoorOpen className="size-5" aria-hidden="true" />
                        </span>
                    )}
                    <span className="min-w-0">
                        <span className="block text-xs font-medium text-amber-700 dark:text-amber-300">
                            {room.organization}
                        </span>
                        <span className="mt-0.5 block font-semibold">
                            {room.name}
                        </span>
                        {!isPrivate && (
                            <span className="text-muted-foreground mt-1 block text-sm">
                                {room.description}
                            </span>
                        )}
                        <span className="text-muted-foreground mt-2 block text-xs">
                            {ballotSummary}
                        </span>
                    </span>
                </div>
                {isPrivate ? (
                    <LockKeyhole
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                    />
                ) : (
                    <ArrowRight
                        className="text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                )}
            </Card>
        </button>
    );
}
