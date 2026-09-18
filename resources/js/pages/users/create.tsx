import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import users from '@/routes/users';

type UserRole = 'teacher' | 'student' | 'organization';

type Props = {
    role: UserRole;
};

export default function CreateUserDialog({ role }: Props) {
    const [open, setOpen] = useState(false);
    const rolePath = `${role}s`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    Add {role}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {role}</DialogTitle>
                    <DialogDescription>
                        Create a new {role} account and assign it the {role}{' '}
                        role.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...users.store.form(rolePath)}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <label htmlFor="name">Name</label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Full name"
                                    required
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="text-destructive text-sm">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="email">Email</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-destructive text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="password">
                                    Temporary password
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    minLength={8}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-destructive text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : `Create ${role}`}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
