import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RoomVisibility } from '@/components/voting/types';

export type PositionDraft = {
    id: number;
    title: string;
    candidates: string;
};

type CreateRoomDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    formError: string;
    visibility: RoomVisibility;
    onVisibilityChange: (visibility: RoomVisibility) => void;
};

export function CreateRoomDialog({
    open,
    onOpenChange,
    onSubmit,
    formError,
    visibility,
    onVisibilityChange,
}: CreateRoomDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Create a voting room</DialogTitle>
                        <DialogDescription>
                            Choose a public room or keep it private and invite
                            people with a code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <label className="grid gap-2 text-sm font-medium">
                            Organization
                            <Input
                                name="organization"
                                placeholder="e.g. Student Council"
                                required
                            />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Room name
                            <Input
                                name="roomName"
                                placeholder="e.g. Room 1"
                                required
                            />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Description
                            <Input
                                name="roomDescription"
                                placeholder="What is this room for?"
                            />
                        </label>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Visibility
                            </label>
                            <Tabs
                                value={visibility}
                                onValueChange={(value) =>
                                    onVisibilityChange(value as RoomVisibility)
                                }
                            >
                                <TabsList className="grid w-full grid-cols-2 p-0">
                                    <TabsTrigger
                                        value="public"
                                        className="data-[state=active]:bg-amber-300/55 data-[state=active]:shadow-none dark:data-[state=active]:bg-amber-300/35"
                                    >
                                        Public
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="private"
                                        className="data-[state=active]:bg-red-300/55 data-[state=active]:shadow-none dark:data-[state=active]:bg-red-300/35"
                                    >
                                        Private
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <p className="text-muted-foreground text-xs">
                                {visibility === 'public'
                                    ? 'Anyone can find and enter this room.'
                                    : 'This room stays hidden until someone joins with its invite code.'}
                            </p>
                        </div>
                        {formError && (
                            <p
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                {formError}
                            </p>
                        )}
                    </div>
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
                            Create room
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type CreateBallotDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    formError: string;
    roomName?: string;
    visibility?: RoomVisibility;
    positionDrafts: PositionDraft[];
    onPositionDraftsChange: Dispatch<SetStateAction<PositionDraft[]>>;
};

export function CreateBallotDialog({
    open,
    onOpenChange,
    onSubmit,
    formError,
    roomName,
    visibility,
    positionDrafts,
    onPositionDraftsChange,
}: CreateBallotDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <form onSubmit={onSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>
                            Create a ballot for {roomName}
                        </DialogTitle>
                        <DialogDescription>
                            This ballot inherits the room’s {visibility}{' '}
                            visibility. Add positions and candidates for voters
                            to choose from.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <label className="grid gap-2 text-sm font-medium">
                            Ballot title
                            <Input
                                name="ballotTitle"
                                placeholder="e.g. Student Council Elections"
                                required
                            />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Description
                            <Input
                                name="ballotDescription"
                                placeholder="Instructions for voters"
                            />
                        </label>
                        <div className="space-y-4">
                            {positionDrafts.map((position, index) => (
                                <Card
                                    key={position.id}
                                    className="bg-muted/20 gap-4 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold">
                                            Position {index + 1}
                                        </h3>
                                        {positionDrafts.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-label={`Remove position ${index + 1}`}
                                                onClick={() =>
                                                    onPositionDraftsChange(
                                                        (current) =>
                                                            current.filter(
                                                                (item) =>
                                                                    item.id !==
                                                                    position.id,
                                                            ),
                                                    )
                                                }
                                            >
                                                <Minus aria-hidden="true" />{' '}
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <label className="grid gap-2 text-sm font-medium">
                                        Position name
                                        <Input
                                            value={position.title}
                                            onChange={(event) =>
                                                onPositionDraftsChange(
                                                    (current) =>
                                                        current.map((item) =>
                                                            item.id ===
                                                            position.id
                                                                ? {
                                                                      ...item,
                                                                      title: event
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : item,
                                                        ),
                                                )
                                            }
                                            placeholder="e.g. President"
                                            required
                                        />
                                    </label>
                                    <label className="grid gap-2 text-sm font-medium">
                                        Candidates
                                        <span className="text-muted-foreground font-normal">
                                            Enter one candidate per line; at
                                            least two.
                                        </span>
                                        <textarea
                                            value={position.candidates}
                                            onChange={(event) =>
                                                onPositionDraftsChange(
                                                    (current) =>
                                                        current.map((item) =>
                                                            item.id ===
                                                            position.id
                                                                ? {
                                                                      ...item,
                                                                      candidates:
                                                                          event
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : item,
                                                        ),
                                                )
                                            }
                                            rows={4}
                                            placeholder={
                                                'Candidate one\nCandidate two'
                                            }
                                            className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                                            required
                                        />
                                    </label>
                                </Card>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    onPositionDraftsChange((current) => [
                                        ...current,
                                        {
                                            id: Date.now(),
                                            title: '',
                                            candidates: '',
                                        },
                                    ])
                                }
                            >
                                <Plus aria-hidden="true" />
                                Add position
                            </Button>
                        </div>
                        {formError && (
                            <p
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                {formError}
                            </p>
                        )}
                    </div>
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
                            Create ballot
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
