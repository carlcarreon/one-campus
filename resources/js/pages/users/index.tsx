import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { DataTable } from '@/components/ui/data-table';
import type { UserRow } from '@/pages/users/columns';
import CreateUserDialog from '@/pages/users/create';
import { createUserColumns } from '@/pages/users/columns';
import users from '@/routes/users';

type UsersPage = {
    data: UserRow[];
    current_page: number;
    last_page: number;
    per_page: number;
};
type Props = {
    users: UsersPage;
    role: 'teacher' | 'student' | 'organization';
    title: string;
};

export default function UsersIndex({ users: page, role, title }: Props) {
    const rolePath = `${role}s`;
    const columns = createUserColumns((page.current_page - 1) * page.per_page);

    return (
        <>
            <Head title={title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title={title}
                        description={`Manage ${rolePath}`}
                    />
                    <CreateUserDialog role={role} />
                </div>
                <DataTable
                    columns={columns}
                    data={page.data}
                    getRowId={(user) => user.id}
                    emptyMessage={`No ${rolePath} found.`}
                />
            </div>
        </>
    );
}

UsersIndex.layout = ({ role, title }: Props) => ({
    breadcrumbs: [{ title, href: users.index(`${role}s`) }],
});
