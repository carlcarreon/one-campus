import { CalendarDays, Clock3, ImageOff, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CampusEvent } from '@/components/event/types';

type EventCardProps = {
    event: CampusEvent;
    isPassed?: boolean;
};

export function EventCard({ event, isPassed = false }: EventCardProps) {
    return (
        <Card
            className={`grid grid-cols-10 gap-0 overflow-hidden py-0 ${
                isPassed
                    ? 'border-l-4 border-l-[#641b2e] bg-[#641b2e]/5 dark:bg-[#641b2e]/20'
                    : ''
            }`}
        >
            <div className="col-span-6 flex min-w-0 flex-col justify-center gap-4 p-3 min-[520px]:p-5">
            <CardHeader className="gap-2 p-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                    <CalendarDays
                        className={`size-4 ${isPassed ? 'text-[#641b2e] dark:text-rose-300' : 'text-amber-700 dark:text-amber-400'}`}
                        aria-hidden="true"
                    />
                    <span className={isPassed ? 'text-[#641b2e] dark:text-rose-300' : 'text-amber-700 dark:text-amber-400'}>
                        {event.date}
                    </span>
                    {isPassed && (
                        <span className="rounded bg-[#641b2e] px-2 py-0.5 text-[10px] text-white">
                            Passed
                        </span>
                    )}
                </div>
                <CardTitle className={`text-lg ${isPassed ? 'text-[#641b2e] dark:text-rose-200' : 'text-[#641b2e] dark:text-amber-100'}`}>
                    {event.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 leading-relaxed">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 p-0 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                    <Clock3 className="size-4 shrink-0 text-[#7d273a] dark:text-amber-300" aria-hidden="true" />
                    <span>{event.startTime} – {event.endTime}</span>
                </p>
                <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-[#7d273a] dark:text-amber-300" aria-hidden="true" />
                    <span className="truncate">{event.venue}</span>
                </p>
            </CardContent>
            </div>
            <div className={`relative col-span-4 min-h-40 overflow-hidden min-[520px]:min-h-48 ${event.imageUrl ? 'bg-gradient-to-br from-[#641b2e] via-[#7d273a] to-amber-700' : 'bg-muted'}`}>
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.imageAlt ?? ''} className="absolute inset-0 size-full object-cover" />
                ) : (
                    <div className="relative z-10 flex h-full items-center justify-center text-muted-foreground" aria-label="No event image">
                        <ImageOff className="size-8" aria-hidden="true" />
                    </div>
                )}
                {event.imageUrl && (
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r from-card via-card/70 to-transparent"
                        aria-hidden="true"
                    />
                )}
            </div>
        </Card>
    );
}
