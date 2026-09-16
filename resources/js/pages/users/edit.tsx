import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import users from '@/routes/users';

type UserIdentity = { id: string; name: string; email: string };

export default function UsersEdit({ user }: { user: UserIdentity }) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <div className="flex flex-col gap-6 p-4">
                <Heading variant="small" title="Edit User" description="User editing will be available soon" />
                <div className="rounded-xl border p-6">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
            </div>
        </>
    );
}

UsersEdit.layout = { breadcrumbs: [{ title: 'Manage Users', href: users.index("teachers") }, { title: 'Edit User', href: '#' }] };