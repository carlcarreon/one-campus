import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as teams } from '@/routes/teams';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Security',
        href: editSecurity(),
    },
    {
        title: 'Teams',
        href: teams(),
    },
    {
        title: 'Appearance',
        href: editAppearance(),
    },
];

const topNavItems = [
    { title: 'All', href: editProfile({ query: { view: 'all' } }) },
    {
        title: 'Organizations',
        href: editProfile({ query: { view: 'organizations' } }),
    },
    { title: 'Teams', href: teams() },
    { title: 'Settings', href: editSecurity() },
];

const communityPosts = [
    {
        author: 'Mika Santos',
        role: 'Student · Arts & Culture Club',
        text: 'The campus is looking extra beautiful this afternoon.',
    },
    {
        author: 'One Campus Office',
        role: 'Organization announcement',
        text: 'The Student Organization Fair is coming up soon.',
    },
    {
        author: 'Jules Mendoza',
        role: 'Campus Volunteers',
        text: 'There is still room for more hands at the campus clean-up.',
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const page = usePage();
    const { auth, currentTeam } = page.props;
    const getInitials = useInitials();
    const isSettingsPage =
        isCurrentOrParentUrl(editSecurity()) ||
        isCurrentOrParentUrl(editAppearance());
    const isProfilePage = isCurrentOrParentUrl(editProfile());
    const isOrganizationsPage = page.url.includes('view=organizations');
    const isEditProfilePage = page.url.includes('view=edit');

    return (
        <div className="px-4 py-6">
            <div className="mb-8">
                <div className="bg-muted relative h-48 rounded-2xl border">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="absolute right-4 bottom-4 bg-[#641b2e] text-white hover:bg-[#4d1423]"
                    >
                        Add cover photo
                    </Button>
                </div>
                <div className="relative -mt-10 ml-6 flex w-[calc(100%-1.5rem)] items-start justify-between pr-4">
                    <div className="flex items-end gap-4">
                        <Avatar className="size-32 border-4 border-background">
                            <AvatarImage
                                src={auth.user.avatar}
                                alt={auth.user.name}
                            />
                            <AvatarFallback className="bg-neutral-200 text-xl text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="pb-8">
                            <p className="text-lg font-semibold">
                                {auth.user.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {auth.user.email}
                            </p>
                        </div>
                    </div>
                    <Button asChild type="button" variant="outline" className="mt-12">
                        <Link href={editProfile({ query: { view: 'edit' } })}>
                            Edit profile
                        </Link>
                    </Button>
                </div>
            </div>
            <Tabs
                value={
                    isSettingsPage
                        ? 'Settings'
                        : isOrganizationsPage
                          ? 'Organizations'
                        : topNavItems.find((item) =>
                            isCurrentOrParentUrl(item.href),
                          )?.title ?? 'All'
                }
                className="w-full"
            >
                <TabsList variant="line" className="grid w-full grid-cols-4">
                    {topNavItems.map((item) => (
                        <TabsTrigger key={item.title} value={item.title} asChild>
                            <Link href={item.href}>{item.title}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {isSettingsPage && (
                <Tabs
                    value={
                        sidebarNavItems.find((item) =>
                            isCurrentOrParentUrl(item.href),
                        )?.title ?? 'Security'
                    }
                    className="mt-4 w-full"
                >
                    <TabsList variant="line" className="grid w-full grid-cols-2">
                        {sidebarNavItems
                            .filter((item) => item.title !== 'Teams')
                            .map((item) => (
                                <TabsTrigger key={item.title} value={item.title} asChild>
                                    <Link href={item.href}>{item.title}</Link>
                                </TabsTrigger>
                            ))}
                    </TabsList>
                </Tabs>
            )}

            {isProfilePage && !isEditProfilePage ? (
                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>
                                {isOrganizationsPage
                                    ? 'Organization information'
                                    : 'Personal information'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    {isOrganizationsPage
                                        ? 'Organization'
                                        : 'Name'}
                                </p>
                                <p className="font-medium">
                                    {isOrganizationsPage
                                        ? currentTeam?.name ?? 'Your organization'
                                        : auth.user.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    {isOrganizationsPage ? 'Description' : 'Email'}
                                </p>
                                <p className="font-medium">
                                    {isOrganizationsPage
                                        ? 'Posts and updates from your organization.'
                                        : auth.user.email}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {communityPosts
                            .filter(
                                (post) =>
                                    !isOrganizationsPage ||
                                    post.role.includes('Organization'),
                            )
                            .map((post) => (
                                <Card key={post.author} className="p-5">
                                    <p className="text-sm font-semibold">
                                        {post.author}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {post.role}
                                    </p>
                                    <p className="mt-3 text-sm">{post.text}</p>
                                </Card>
                            ))}
                    </div>
                </div>
            ) : (
                <section className="mt-6 max-w-xl space-y-12">
                    {children}
                </section>
            )}
        </div>
    );
}
