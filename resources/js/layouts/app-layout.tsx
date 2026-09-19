import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { isAdminLayout } = usePage().props;
    const Layout = isAdminLayout ? AppSidebarLayout : AppHeaderLayout;

    return <Layout breadcrumbs={breadcrumbs}>{children}</Layout>;
}
