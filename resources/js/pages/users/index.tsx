import { Head, Link } from "@inertiajs/react";
import { Pencil } from "lucide-react";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import CreateUserDialog from "@/pages/users/create";
import users from "@/routes/users";

type UserRow = {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string | null;
};
type UsersPage = { data: UserRow[]; current_page: number; last_page: number };
type Props = { users: UsersPage; role: "teacher" | "student" | "organization"; title: string };

export default function UsersIndex({ users: page, role, title }: Props) {
    const rolePath = `${role}s`;
    return (
        <>
            <Head title={title} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading variant="small" title={title} description={`Manage ${rolePath}`} />
                    <CreateUserDialog role={role} />
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {page.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {user.email_verified_at ? "Verified" : "Unverified"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : "â€”"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={users.edit(user.id)}>
                                                <Pencil className="size-4" />
                                                <span className="sr-only">Edit {user.name}</span>
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {page.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-muted-foreground px-4 py-8 text-center"
                                    >
                                        No {rolePath} found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = ({ role, title }: Props) => ({
    breadcrumbs: [{ title, href: users.index(`${role}s`) }],
});
