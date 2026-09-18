import { StrictMode, useEffect } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'One Campus';

type InertiaRootWindow = Window & {
    __oneCampusInertiaRoot?: { element: HTMLElement; root: Root };
};

function DismissStartupLoader() {
    useEffect(() => {
        const loader = document.getElementById('app-startup-loader');

        if (!loader) {
            return;
        }

        loader.dataset.ready = 'true';

        const timeout = window.setTimeout(() => loader.remove(), 200);

        return () => window.clearTimeout(timeout);
    }, []);

    return null;
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
            case name.startsWith('teams/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    setup({ el, App, props }) {
        const app = (
            <StrictMode>
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                    <Toaster />
                    <DismissStartupLoader />
                </TooltipProvider>
            </StrictMode>
        );

        if (!el) {
            return app;
        }

        const rootWindow = window as InertiaRootWindow;
        const existingRoot = rootWindow.__oneCampusInertiaRoot;

        if (existingRoot?.element === el) {
            return;
        }

        existingRoot?.root.unmount();

        const root = el.hasAttribute('data-server-rendered')
            ? hydrateRoot(el, app)
            : createRoot(el);

        rootWindow.__oneCampusInertiaRoot = { element: el, root };

        if (!el.hasAttribute('data-server-rendered')) {
            root.render(app);
        }
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
