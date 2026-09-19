import { useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, LogIn, Search, UserRoundCog } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { index as feedIndex } from '@/routes/feed';
import { index as eventsIndex } from '@/routes/events';
import { index as votingIndex } from '@/routes/voting';
import { index as chatIndex } from '@/routes/chat';
import {
    returnMethod as returnFromDemo,
    switchMethod as switchDemoAccount,
} from '@/routes/demo-accounts';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const searchablePages = [
    { title: 'Feed', href: feedIndex.url() },
    { title: 'Events', href: eventsIndex.url() },
    { title: 'Voting', href: votingIndex.url() },
    { title: 'Chat', href: chatIndex.url() },
];

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { demoAccount } = usePage().props;
    const [query, setQuery] = useState('');
    const filteredPages = useMemo(
        () => searchablePages.filter((page) => page.title.toLowerCase().includes(query.trim().toLowerCase())),
        [query],
    );
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {(demoAccount.isSwitchable || demoAccount.isSwitched) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            data-test="demo-account-switcher"
                        >
                            <UserRoundCog className="mr-2 size-4" aria-hidden="true" />
                            {demoAccount.currentRole
                                ? `${demoAccount.currentRole.charAt(0).toUpperCase()}${demoAccount.currentRole.slice(1)} Account`
                                : 'Account'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Demo accounts
                        </DropdownMenuLabel>
                        {demoAccount.accounts.map((account) => (
                            <DropdownMenuItem
                                key={account.id}
                                data-test="demo-account-switcher-item"
                                onSelect={() =>
                                    router.post(
                                        switchDemoAccount.url(account.id),
                                    )
                                }
                            >
                                <span>{account.name}</span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                    {account.email}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {demoAccount.isSwitched && (
                <Button
                    variant="outline"
                    size="sm"
                    data-test="demo-account-return"
                    onClick={() => router.post(returnFromDemo.url())}
                >
                    <LogIn className="mr-2 size-4" aria-hidden="true" />
                    Return to Superadmin
                </Button>
            )}
            <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                        <Bell aria-hidden="true" />
                    </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false} className="gap-4 p-4 sm:max-w-md">
                    <DialogTitle>Notifications</DialogTitle>
                    <p className="py-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>
                </DialogContent>
            </Dialog>
            <Dialog open={isSearchOpen} onOpenChange={(open) => {
                setIsSearchOpen(open);
                if (!open) {
                    setQuery('');
                }
            }}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Search pages">
                        <Search aria-hidden="true" />
                    </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false} className="gap-4 p-4 sm:max-w-lg">
                    <DialogTitle className="sr-only">Search pages</DialogTitle>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search pages..."
                            className="pl-9"
                            aria-label="Search pages"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="px-2 text-xs font-medium text-muted-foreground">Pages</p>
                        <div className="max-h-72 overflow-y-auto">
                            {filteredPages.map((page) => (
                                <DialogClose asChild key={page.title}>
                                    <Link href={page.href} className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                                        {page.title}
                                    </Link>
                                </DialogClose>
                            ))}
                            {filteredPages.length === 0 && (
                                <p className="px-3 py-4 text-sm text-muted-foreground">No pages found.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
}
