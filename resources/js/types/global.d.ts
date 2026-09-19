import type { Auth } from '@/types/auth';
import type { Team } from '@/types/teams';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            can: {
                manageUsers: boolean;
            };
            isAdminLayout: boolean;
            sidebarOpen: boolean;
            currentTeam: Team | null;
            teams: Team[];
            demoAccount: {
                isSwitchable: boolean;
                isSwitched: boolean;
                originalName: string | null;
                currentRole: string | null;
                accounts: Array<{ id: string; name: string; email: string }>;
            };
            [key: string]: unknown;
        };
    }
}
