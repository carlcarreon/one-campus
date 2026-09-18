import type { VotingRoom } from '@/components/voting/types';

export type {
    Ballot,
    BallotPosition,
    BallotStatus,
    Candidate,
    RoomVisibility,
    VotingRoom,
} from '@/components/voting/types';

export const initialRooms: VotingRoom[] = [
    {
        id: 'student-council-room-1',
        slug: 'student-council-room-1',
        organization: 'Student Council',
        name: 'Room 1',
        description: 'First-year student representatives',
        visibility: 'public',
        joined: true,
        ballot: {
            id: 'student-council-room-1-ballot',
            title: 'Room 1 Student Council Ballot',
            description:
                'Select one candidate for each position and submit your ballot.',
            closesAt: 'Closes in 2 days',
            status: 'open',
            positions: [
                {
                    id: 'room1-president',
                    title: 'Room Representative',
                    candidates: [
                        { id: 'maya', name: 'Maya Santos', votes: 14 },
                        { id: 'leo', name: 'Leo Garcia', votes: 9 },
                        { id: 'sam', name: 'Sam Reyes', votes: 6 },
                    ],
                },
                {
                    id: 'room1-liaison',
                    title: 'Class Liaison',
                    candidates: [
                        { id: 'nico', name: 'Nico Flores', votes: 12 },
                        { id: 'jules', name: 'Jules Mendoza', votes: 8 },
                    ],
                },
            ],
        },
    },
    {
        id: 'student-council-room-2',
        slug: 'student-council-room-2',
        organization: 'Student Council',
        name: 'Room 2',
        description: 'Second-year student representatives',
        visibility: 'public',
        joined: true,
        ballot: {
            id: 'student-council-room-2-ballot',
            title: 'Room 2 Representative Ballot',
            description: 'Choose the representative for Room 2.',
            closesAt: 'Ended September 1',
            status: 'closed',
            positions: [
                {
                    id: 'room2-president',
                    title: 'Room Representative',
                    candidates: [
                        { id: 'ava', name: 'Ava Cruz', votes: 11 },
                        { id: 'eli', name: 'Eli Mendoza', votes: 13 },
                        { id: 'kai', name: 'Kai Rivera', votes: 4 },
                    ],
                },
            ],
        },
    },
    {
        id: 'environment-garden',
        slug: 'environment-garden',
        organization: 'Environment Club',
        name: 'Garden Team',
        description: 'Students working together for a greener campus.',
        visibility: 'private',
        inviteCode: 'GREEN-TEAM',
        joined: false,
        ballot: {
            id: 'environment-garden-ballot',
            title: 'Garden Team Ballot',
            description:
                'Select the coordinator for the next campus garden cycle.',
            closesAt: 'Closes in 3 days',
            status: 'open',
            positions: [
                {
                    id: 'garden-coordinator',
                    title: 'Garden Team Coordinator',
                    candidates: [
                        { id: 'robin', name: 'Robin Park', votes: 8 },
                        { id: 'drew', name: 'Drew Lim', votes: 7 },
                    ],
                },
            ],
        },
    },
    {
        id: 'student-council-private-room',
        slug: 'student-council-private-room',
        organization: 'Student Council',
        name: 'Election Committee',
        description: 'Private planning room for election volunteers.',
        visibility: 'private',
        inviteCode: 'ROOM1-2026',
        joined: false,
    },
];
