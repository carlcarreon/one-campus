export type CampusEvent = {
    title: string;
    description: string;
    date: string;
    dateKey: string;
    startTime: string;
    endTime: string;
    venue: string;
    calendarStart: string;
    calendarEnd: string;
    imageUrl?: string;
    imageUrls?: string[];
    imageAlt?: string;
    visibility?: 'public' | 'organization' | 'private';
    organization?: string;
    targetOrganization?: string;
    inviteEmails?: string[];
};
