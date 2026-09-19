import { useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Bell,
    MessageCircle,
    Menu,
    Newspaper,
    Search,
    UserRound,
    UserRoundCog,
    Vote,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
// import { TeamSwitcher } from '@/components/team-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import events from '@/routes/events';
import feed from '@/routes/feed';
import chat from '@/routes/chat';
import { returnMethod as returnFromDemo } from '@/routes/demo-accounts';
import { switchMethod as switchDemoAccount } from '@/routes/demo-accounts';
import voting from '@/routes/voting';
import { edit as profile } from '@/routes/profile';
import { index as feedIndex } from '@/routes/feed';
import { index as eventsIndex } from '@/routes/events';
import { index as votingIndex } from '@/routes/voting';
import { index as chatIndex } from '@/routes/chat';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const bottomNavItems: NavItem[] = [
    { title: 'Feed', href: feed.index(), icon: Newspaper },
    { title: 'Events', href: events.index(), icon: CalendarDays },
    { title: 'Voting', href: voting.index(), icon: Vote },
    { title: 'Chat', href: chat.index(), icon: MessageCircle },
    { title: 'Profile', href: profile(), icon: UserRound },
];

const searchablePages = [
    { title: 'Feed', href: feedIndex.url() },
    { title: 'Events', href: eventsIndex.url() },
    { title: 'Voting', href: votingIndex.url() },
    { title: 'Chat', href: chatIndex.url() },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, currentTeam, demoAccount } = page.props;
    const [query, setQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const filteredPages = useMemo(
        () => searchablePages.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase())),
        [query],
    );
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            {demoAccount.isSwitched && (
                <div className="flex items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                    <span>
                        Demo mode: acting as {auth.user.name} (original account:{' '}
                        {demoAccount.originalName})
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.post(returnFromDemo.url())}
                    >
                        Return to Superadmin
                    </Button>
                </div>
            )}
            <div className="border-sidebar-border/80 border-b">
                <div className="relative mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-7 w-7 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboardUrl}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <nav
                        aria-label="Main navigation"
                        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
                    >
                        {bottomNavItems
                            .filter((item) => item.title !== 'Profile')
                            .map((item) => {
                            const isActive = isCurrentUrl(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive &&
                                            'text-foreground bg-accent',
                                    )}
                                    aria-current={
                                        isActive ? 'page' : undefined
                                    }
                                >
                                    {item.icon && (
                                        <item.icon className="size-4" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                            })}
                    </nav>

                    <div className="ml-auto flex items-center space-x-2">
                        {(demoAccount.isSwitchable ||
                            demoAccount.isSwitched) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        data-test="demo-account-switcher"
                                    >
                                        <UserRoundCog className="mr-2 size-4" />{' '}
                                        Switch demo account
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                                        Demo accounts
                                    </DropdownMenuLabel>
                                    {demoAccount.accounts.map((account) => (
                                        <DropdownMenuItem
                                            key={account.id}
                                            onSelect={() =>
                                                router.post(
                                                    switchDemoAccount.url(
                                                        account.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <span>{account.name}</span>
                                            <span className="text-muted-foreground ml-2 text-xs">
                                                {account.email}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                    {demoAccount.isSwitched && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    router.post(
                                                        returnFromDemo.url(),
                                                    )
                                                }
                                            >
                                                Return to Superadmin
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <div className="relative flex items-center space-x-1">
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
                                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
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
                                        <p className="text-muted-foreground px-2 text-xs font-medium">Pages</p>
                                        <div className="max-h-72 overflow-y-auto">
                                            {filteredPages.map((item) => (
                                                <DialogClose asChild key={item.title}>
                                                    <Link href={item.href} className="hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-sm font-medium">
                                                        {item.title}
                                                    </Link>
                                                </DialogClose>
                                            ))}
                                            {filteredPages.length === 0 && (
                                                <p className="text-muted-foreground px-3 py-4 text-sm">No pages found.</p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Dialog
                            open={isNotificationsOpen}
                            onOpenChange={setIsNotificationsOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Notifications"
                                >
                                    <Bell aria-hidden="true" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                showCloseButton={false}
                                className="gap-4 p-4 sm:max-w-md"
                            >
                                <DialogTitle>Notifications</DialogTitle>
                                <p className="text-muted-foreground py-6 text-center text-sm">
                                    You’re all caught up.
                                </p>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* <TeamSwitcher inHeader /> */}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
            <nav
                aria-label="Main navigation"
                className="bg-background border-sidebar-border/80 fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
            >
                <div className="mx-auto grid h-16 max-w-7xl grid-cols-5">
                    {bottomNavItems.map((item) => {
                        const isActive = isCurrentUrl(item.href);

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                    isActive &&
                                        'text-foreground bg-accent',
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.icon && <item.icon className="size-5" />}
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
