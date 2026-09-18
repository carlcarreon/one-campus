import { Link } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataTableFeatures } from '@/components/ui/data-table';
import users from '@/routes/users';

export type UserRow = {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string | null;
};

const columnHelper = createColumnHelper<DataTableFeatures, UserRow>();

export function createUserColumns(rowOffset: number) {
    return columnHelper.columns([
        columnHelper.display({
            id: 'number',
            header: '#',
            cell: ({ row }) => row.index + rowOffset + 1,
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue()}</span>
            ),
        }),
        columnHelper.accessor('email', {
            header: 'Email',
        }),
        columnHelper.accessor('email_verified_at', {
            header: 'Status',
            cell: ({ getValue }) => (getValue() ? 'Verified' : 'Unverified'),
        }),
        columnHelper.accessor('created_at', {
            header: 'Created',
            cell: ({ getValue }) => {
                const createdAt = getValue();

                return createdAt
                    ? new Date(createdAt).toLocaleDateString()
                    : '—';
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={users.edit(row.original.id)}>
                            <Pencil className="size-4" />
                            <span className="sr-only">
                                Edit {row.original.name}
                            </span>
                        </Link>
                    </Button>
                </div>
            ),
        }),
    ]);
}
