import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function VotingIndex() {
    return (
        <>
            <Head title="Voting" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-xl font-semibold">Voting</h1>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

VotingIndex.layout = {
    breadcrumbs: [{ title: 'Voting', href: '/voting' }],
};
