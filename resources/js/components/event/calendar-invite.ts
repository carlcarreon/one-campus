import type { CampusEvent } from '@/components/event/types';

function escapeCalendarText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

export function downloadCalendarInvite(event: CampusEvent): void {
    const calendarInvite = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//One Campus//Events//EN',
        'BEGIN:VEVENT',
        `DTSTART:${event.calendarStart}`,
        `DTEND:${event.calendarEnd}`,
        `SUMMARY:${escapeCalendarText(event.title)}`,
        `DESCRIPTION:${escapeCalendarText(event.description)}`,
        `LOCATION:${escapeCalendarText(event.venue)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
    const file = new Blob([calendarInvite], {
        type: 'text/calendar;charset=utf-8',
    });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
}
