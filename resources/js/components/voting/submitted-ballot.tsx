import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Ballot } from './types';

export function SubmittedBallotDialog({
    open,
    onOpenChange,
    ballot,
    roomId,
    selections,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ballot?: Ballot;
    roomId?: string;
    selections: Record<string, string>;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="items-center text-center">
                    <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <Check className="size-6" aria-hidden="true" />
                    </span>
                    <DialogTitle>Your submitted ballot</DialogTitle>
                    <DialogDescription>{ballot?.title}</DialogDescription>
                </DialogHeader>
                {ballot && roomId && (
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Name
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Vote
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ballot.positions.map((position) => {
                                    const selectedCandidateId =
                                        selections[`${roomId}:${position.id}`];
                                    const selectedCandidate =
                                        position.candidates.find(
                                            (candidate) =>
                                                candidate.id ===
                                                selectedCandidateId,
                                        );

                                    return (
                                        <TableRow key={position.id}>
                                            <TableCell className="font-semibold">
                                                {position.title}
                                            </TableCell>
                                            <TableCell>
                                                {selectedCandidate?.name ?? '—'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
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
