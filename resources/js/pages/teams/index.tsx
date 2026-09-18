import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import CreateTeamModal from '@/components/create-team-modal';
import Heading from '@/components/heading';
import LeaveTeamModal from '@/components/leave-team-modal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createTeamColumns } from '@/pages/teams/columns';
import { index } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    teams: Team[];
};

export default function TeamsIndex({ teams }: Props) {
    const [leaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false);
    const [teamLeaving, setTeamLeaving] = useState<Team | null>(null);

    const openLeaveTeamDialog = useCallback((team: Team) => {
        setTeamLeaving(team);
        setLeaveTeamDialogOpen(true);
    }, []);
    const columns = useMemo(
        () => createTeamColumns(openLeaveTeamDialog),
        [openLeaveTeamDialog],
    );

    return (
        <>
            <Head title="Teams" />

            <h1 className="sr-only">Teams</h1>

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Teams"
                        description="Manage your teams and team memberships"
                    />

                    <CreateTeamModal>
                        <Button data-test="teams-new-team-button">
                            <Plus /> New team
                        </Button>
                    </CreateTeamModal>
                </div>

                <DataTable
                    columns={columns}
                    data={teams}
                    getRowId={(team) => String(team.id)}
                    getRowTestId={() => 'team-row'}
                    emptyMessage="You don't belong to any teams yet."
                />
            </div>

            <LeaveTeamModal
                team={teamLeaving}
                open={leaveTeamDialogOpen}
                onOpenChange={setLeaveTeamDialogOpen}
            />
        </>
    );
}

TeamsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Teams',
            href: index(),
        },
    ],
};
