import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Ballot, VotingRoom } from './types';

function ballotSelectionKey(roomId: string, positionId: string): string {
    return `${roomId}:${positionId}`;
}

export function BallotCard({
    room,
    ballot,
    selections,
    hasSubmitted,
    onSelect,
    onSubmit,
}: {
    room: VotingRoom;
    ballot: Ballot;
    selections: Record<string, string>;
    hasSubmitted: boolean;
    onSelect: (positionId: string, candidateId: string) => void;
    onSubmit: () => void;
}) {
    const isClosed = ballot.status === 'closed';
    const allPositionsChosen = ballot.positions.every(
        (position) => selections[ballotSelectionKey(room.id, position.id)],
    );

    return (
        <Card className="gap-0 overflow-hidden py-0">
            <div className="space-y-6 p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Badge
                            variant="outline"
                            className={
                                isClosed
                                    ? 'text-muted-foreground'
                                    : 'border-amber-500/40 text-amber-800 dark:text-amber-300'
                            }
                        >
                            {isClosed
                                ? 'Ballot closed · Results'
                                : 'Official ballot'}
                        </Badge>
                        <div>
                            <h3 className="text-xl font-bold">
                                {ballot.title}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {ballot.description}
                            </p>
                        </div>
                    </div>
                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {ballot.closesAt}
                    </span>
                </div>

                <div className="space-y-5">
                    {ballot.positions.map((position, positionIndex) => {
                        const selectionKey = ballotSelectionKey(
                            room.id,
                            position.id,
                        );
                        const totalVotes = position.candidates.reduce(
                            (total, candidate) => total + candidate.votes,
                            0,
                        );
                        const leadingVoteCount = Math.max(
                            ...position.candidates.map(
                                (candidate) => candidate.votes,
                            ),
                        );
                        const selectedCandidate = selections[selectionKey];

                        return (
                            <fieldset
                                key={position.id}
                                disabled={isClosed || hasSubmitted}
                                className="space-y-2"
                            >
                                <legend className="mb-2 flex w-full items-baseline justify-between gap-3 border-b pb-2">
                                    <span className="font-semibold">
                                        {positionIndex + 1}. {position.title}
                                    </span>
                                    {isClosed && (
                                        <span className="text-muted-foreground text-xs">
                                            {totalVotes} votes
                                        </span>
                                    )}
                                </legend>
                                {position.candidates.map((candidate) => {
                                    const isSelected =
                                        selectedCandidate === candidate.id;
                                    const percentage =
                                        totalVotes > 0
                                            ? Math.round(
                                                  (candidate.votes /
                                                      totalVotes) *
                                                      100,
                                              )
                                            : 0;
                                    const isWinner =
                                        isClosed &&
                                        totalVotes > 0 &&
                                        candidate.votes === leadingVoteCount;

                                    return (
                                        <label
                                            key={candidate.id}
                                            className={`relative block overflow-hidden rounded-lg border transition-colors ${isClosed ? 'cursor-default' : 'cursor-pointer hover:border-amber-500/60'} ${isWinner ? 'border-green-600/30 bg-green-500/5 dark:bg-green-500/5' : isSelected ? 'border-green-600 bg-green-500/10 ring-1 ring-green-600/20 dark:bg-green-500/15' : 'border-border'}`}
                                        >
                                            {isClosed && (
                                                <span
                                                    className={`absolute inset-y-0 left-0 ${isWinner ? 'bg-green-500/20 dark:bg-green-500/15' : 'bg-muted/70'}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span className="relative flex items-center gap-3 px-3.5 py-3">
                                                {!isClosed && (
                                                    <input
                                                        type="radio"
                                                        name={`ballot-${room.id}-${position.id}`}
                                                        value={candidate.id}
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            onSelect(
                                                                position.id,
                                                                candidate.id,
                                                            )
                                                        }
                                                        disabled={hasSubmitted}
                                                        className="size-4 accent-green-600"
                                                    />
                                                )}
                                                <span className="flex-1 text-sm font-medium">
                                                    {candidate.name}
                                                </span>
                                                {isClosed && (
                                                    <span className="text-muted-foreground text-xs font-semibold">
                                                        {percentage}% ·{' '}
                                                        {candidate.votes}
                                                    </span>
                                                )}
                                                {hasSubmitted && isSelected && (
                                                    <Check
                                                        className="size-4 text-green-600 dark:text-green-400"
                                                        aria-label="Your selection"
                                                    />
                                                )}
                                            </span>
                                        </label>
                                    );
                                })}
                            </fieldset>
                        );
                    })}
                </div>

                {isClosed ? (
                    <p className="text-muted-foreground border-t pt-4 text-sm">
                        This ballot is closed. Final results are shown above.
                    </p>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <p className="text-muted-foreground text-xs">
                            {hasSubmitted
                                ? 'Your ballot has been submitted.'
                                : `${ballot.positions.length} positions · Select one candidate for each.`}
                        </p>
                        <Button
                            type="button"
                            disabled={!allPositionsChosen || hasSubmitted}
                            onClick={onSubmit}
                            className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                        >
                            {hasSubmitted
                                ? 'Ballot submitted'
                                : 'Submit ballot'}
                            {!hasSubmitted && <ArrowRight aria-hidden="true" />}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
