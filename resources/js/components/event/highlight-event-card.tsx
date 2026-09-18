import { CalendarDays, CalendarPlus, Clock3, ImageOff, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CampusEvent } from '@/components/event/types';

type HighlightEventCardProps = {
    event: CampusEvent;
};

function escapeCalendarText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

function downloadCalendarInvite(event: CampusEvent): void {
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
    const file = new Blob([calendarInvite], { type: 'text/calendar;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
}

export function HighlightEventCard({ event }: HighlightEventCardProps) {
    return (
        <article className="grid min-h-[360px] grid-cols-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="col-span-6 flex min-w-0 flex-col justify-center gap-4 p-3 min-[520px]:gap-6 min-[520px]:p-6 md:p-10">
                <div className="space-y-3">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 uppercase dark:bg-amber-300/15 dark:text-amber-300">
                        Community highlight
                    </span>
                    <h2 className="text-lg font-bold tracking-tight text-[#641b2e] min-[520px]:text-2xl sm:text-3xl dark:text-amber-100">
                        {event.title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground min-[520px]:text-base">
                        {event.description}
                    </p>
                </div>

                <dl className="grid gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <CalendarDays className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Date</dt>
                            <dd className="mt-1 font-semibold">{event.date}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <Clock3 className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Time</dt>
                            <dd className="mt-1 font-semibold">{event.startTime} – {event.endTime}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <MapPin className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Venue</dt>
                            <dd className="mt-1 font-semibold">{event.venue}</dd>
                        </div>
                    </div>
                </dl>

                <div>
                    <Button
                        onClick={() => downloadCalendarInvite(event)}
                        className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                    >
                        <CalendarPlus aria-hidden="true" />
                        Add to calendar
                    </Button>
                </div>
            </div>

            <div className={`relative col-span-4 min-h-full overflow-hidden ${event.imageUrl ? 'bg-gradient-to-br from-[#641b2e] via-[#7d273a] to-amber-700' : 'bg-muted'}`}>
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.imageAlt ?? ''}
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div className="relative z-10 flex h-full min-h-48 items-center justify-center text-muted-foreground min-[520px]:min-h-full" aria-label="No event image">
                        <ImageOff className="size-8 min-[520px]:size-10" aria-hidden="true" />
                    </div>
                )}
                {event.imageUrl && (
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r from-card via-card/70 to-transparent"
                        aria-hidden="true"
                    />
                )}
            </div>
        </article>
    );
}
