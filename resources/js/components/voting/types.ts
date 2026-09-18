export type RoomVisibility = 'public' | 'private';
export type BallotStatus = 'open' | 'closed';
export type Candidate = { id: string; name: string; votes: number };
export type BallotPosition = {
    id: string;
    title: string;
    candidates: Candidate[];
};
export type Ballot = {
    id: string;
    title: string;
    description: string;
    closesAt: string;
    status: BallotStatus;
    positions: BallotPosition[];
};
export type VotingRoom = {
    id: string;
    slug: string;
    organization: string;
    name: string;
    description: string;
    visibility: RoomVisibility;
    inviteCode?: string;
    joined: boolean;
    ballot?: Ballot;
};
