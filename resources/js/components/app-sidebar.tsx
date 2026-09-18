import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    ChevronsUpDown,
    FolderGit2,
    LayoutGrid,
    LogIn,
    MessageCircle,
    Newspaper,
    UserRoundCog,
    Users,
    Vote,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import feed from '@/routes/feed';
import events from '@/routes/events';
import voting from '@/routes/voting';
import chat from '@/routes/chat';
import {
    returnMethod as returnFromDemo,
    switchMethod as switchDemoAccount,
} from '@/routes/demo-accounts';
import users from '@/routes/users';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { auth, can, demoAccount } = page.props;
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(can.manageUsers
            ? [
                  {
                      title: 'Manage Teachers',
                      href: users.index('teachers'),
                      icon: Users,
                  },
                  {
                      title: 'Manage Students',
                      href: users.index('students'),
                      icon: Users,
                  },
                  {
                      title: 'Manage Organizations',
                      href: users.index('organizations'),
                      icon: Users,
                  },
              ]
            : []),
        { title: 'Feed', href: feed.index(), icon: Newspaper },
        { title: 'Events', href: events.index(), icon: CalendarDays },
        { title: 'Voting', href: voting.index(), icon: Vote },
        { title: 'Chat', href: chat.index(), icon: MessageCircle },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
                {(demoAccount.isSwitchable || demoAccount.isSwitched) && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                        data-test="demo-account-switcher"
                                    >
                                        <UserRoundCog className="size-4" />
                                        <span className="flex-1 truncate text-left">
                                            {demoAccount.isSwitched
                                                ? `Demo: ${auth.user.name}`
                                                : 'Demo accounts'}
                                        </span>
                                        <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    align="start"
                                    side="right"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                                        Demo accounts
                                    </DropdownMenuLabel>
                                    {demoAccount.accounts.map((account) => (
                                        <DropdownMenuItem
                                            key={account.id}
                                            data-test="demo-account-switcher-item"
                                            className="cursor-pointer gap-2 p-2"
                                            onSelect={() =>
                                                router.post(
                                                    switchDemoAccount.url(
                                                        account.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <span>{account.name}</span>
                                            <span className="text-muted-foreground ml-auto text-xs">
                                                {account.email}
                                            </span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                        {demoAccount.isSwitched && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    data-test="demo-account-return"
                                    onClick={() =>
                                        router.post(returnFromDemo.url())
                                    }
                                >
                                    <LogIn className="size-4" />
                                    <span>Return to Superadmin</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
