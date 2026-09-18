import type { FormEvent } from 'react';
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

type JoinWithCodeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    inviteCode: string;
    onInviteCodeChange: (inviteCode: string) => void;
    inviteError: string;
};

export default function JoinWithCodeDialog({
    open,
    onOpenChange,
    onSubmit,
    inviteCode,
    onInviteCodeChange,
    inviteError,
}: JoinWithCodeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>Join a private room</DialogTitle>
                        <DialogDescription>
                            Enter the invite code you received. The room and its
                            ballot will open after the code is accepted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <label
                            htmlFor="room-invite-code"
                            className="text-sm font-medium"
                        >
                            Invite code
                        </label>
                        <Input
                            id="room-invite-code"
                            value={inviteCode}
                            onChange={(event) =>
                                onInviteCodeChange(event.target.value)
                            }
                            placeholder="Enter invite code"
                            autoComplete="off"
                            aria-invalid={Boolean(inviteError)}
                            autoFocus
                        />
                        {inviteError && (
                            <p
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                {inviteError}
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
                            Join room
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
