import { Link } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, LogOut, Pencil } from 'lucide-react';
import type { Team } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DataTableFeatures } from '@/components/ui/data-table';
import { edit } from '@/routes/teams';

const columnHelper = createColumnHelper<DataTableFeatures, Team>();

export function createTeamColumns(onLeave: (team: Team) => void) {
    return columnHelper.columns([
        columnHelper.accessor('name', {
            header: 'Team',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.isPersonal ? (
                        <Badge variant="secondary">Personal</Badge>
                    ) : null}
                </div>
            ),
        }),
        columnHelper.accessor('roleLabel', {
            header: 'Your role',
            cell: ({ getValue }) => (
                <span className="text-muted-foreground">{getValue()}</span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const team = row.original;
                const canLeaveTeam = !team.isPersonal && team.role !== 'owner';

                return (
                    <TooltipProvider>
                        <div className="flex items-center justify-end gap-2">
                            {canLeaveTeam ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            data-test="team-leave-button"
                                            onClick={() => onLeave(team)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Leave team</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : null}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        data-test={
                                            team.role === 'member'
                                                ? 'team-view-button'
                                                : 'team-edit-button'
                                        }
                                        asChild
                                    >
                                        <Link href={edit(team.slug)}>
                                            {team.role === 'member' ? (
                                                <Eye className="h-4 w-4" />
                                            ) : (
                                                <Pencil className="h-4 w-4" />
                                            )}
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {team.role === 'member'
                                            ? 'View team'
                                            : 'Edit team'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                );
            },
        }),
    ]);
}
