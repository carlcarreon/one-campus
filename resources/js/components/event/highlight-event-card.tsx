import {
    CalendarDays,
    CalendarPlus,
    Clock3,
    ImageOff,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CampusEvent } from '@/components/event/types';
import { downloadCalendarInvite } from '@/components/event/calendar-invite';

type HighlightEventCardProps = {
    event: CampusEvent;
};

export function HighlightEventCard({ event }: HighlightEventCardProps) {
    return (
        <article className="bg-card grid min-h-[360px] grid-cols-10 overflow-hidden rounded-2xl border shadow-sm">
            <div className="col-span-6 flex min-w-0 flex-col justify-center gap-4 p-3 min-[520px]:gap-6 min-[520px]:p-6 md:p-10">
                <div className="space-y-3">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 uppercase dark:bg-amber-300/15 dark:text-amber-300">
                        Community highlight
                    </span>
                    <h2 className="text-lg font-bold tracking-tight text-[#641b2e] min-[520px]:text-2xl sm:text-3xl dark:text-amber-100">
                        {event.title}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed min-[520px]:text-base">
                        {event.description}
                    </p>
                </div>

                <dl className="grid gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <CalendarDays
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div>
                            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Date
                            </dt>
                            <dd className="mt-1 font-semibold">{event.date}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <Clock3 className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Time
                            </dt>
                            <dd className="mt-1 font-semibold">
                                {event.startTime} – {event.endTime}
                            </dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#641b2e]/10 text-[#641b2e] dark:bg-amber-300/10 dark:text-amber-300">
                            <MapPin className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Venue
                            </dt>
                            <dd className="mt-1 font-semibold">
                                {event.venue}
                            </dd>
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

            <div
                className={`relative col-span-4 min-h-full overflow-hidden ${event.imageUrl ? 'bg-gradient-to-br from-[#641b2e] via-[#7d273a] to-amber-700' : 'bg-muted'}`}
            >
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.imageAlt ?? ''}
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div
                        className="text-muted-foreground relative z-10 flex h-full min-h-48 items-center justify-center min-[520px]:min-h-full"
                        aria-label="No event image"
                    >
                        <ImageOff
                            className="size-8 min-[520px]:size-10"
                            aria-hidden="true"
                        />
                    </div>
                )}
                {event.imageUrl && (
                    <div
                        className="from-card via-card/70 pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r to-transparent"
                        aria-hidden="true"
                    />
                )}
            </div>
        </article>
    );
}
