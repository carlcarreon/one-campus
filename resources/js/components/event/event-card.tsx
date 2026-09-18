import { useState } from 'react';
import {
    CalendarDays,
    CalendarPlus,
    Clock3,
    ImageOff,
    MapPin,
    MoveUpRight,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { CampusEvent } from '@/components/event/types';
import { downloadCalendarInvite } from '@/components/event/calendar-invite';

type EventCardProps = {
    event: CampusEvent;
    isPassed?: boolean;
};

export function EventCard({ event, isPassed = false }: EventCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
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
                            <span
                                className={
                                    isPassed
                                        ? 'text-[#641b2e] dark:text-rose-300'
                                        : 'text-amber-700 dark:text-amber-400'
                                }
                            >
                                {event.date}
                            </span>
                            {isPassed && (
                                <span className="rounded bg-[#641b2e] px-2 py-0.5 text-[10px] text-white">
                                    Passed
                                </span>
                            )}
                        </div>
                        <CardTitle
                            className={`text-lg ${isPassed ? 'text-[#641b2e] dark:text-rose-200' : 'text-[#641b2e] dark:text-amber-100'}`}
                        >
                            {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 leading-relaxed">
                            {event.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-muted-foreground grid gap-2 p-0 text-sm">
                        <p className="flex items-center gap-2">
                            <Clock3
                                className="size-4 shrink-0 text-[#7d273a] dark:text-amber-300"
                                aria-hidden="true"
                            />
                            <span>
                                {event.startTime} – {event.endTime}
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            <MapPin
                                className="size-4 shrink-0 text-[#7d273a] dark:text-amber-300"
                                aria-hidden="true"
                            />
                            <span className="truncate">{event.venue}</span>
                        </p>
                    </CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsDetailsOpen(true)}
                        >
                            <MoveUpRight aria-hidden="true" />
                            View Event
                        </Button>
                        {!isPassed && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => downloadCalendarInvite(event)}
                                className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                            >
                                <CalendarPlus aria-hidden="true" />
                                Add to Calendar
                            </Button>
                        )}
                    </div>
                </div>
                <div
                    className={`relative col-span-4 min-h-40 overflow-hidden min-[520px]:min-h-48 ${event.imageUrl ? 'bg-gradient-to-br from-[#641b2e] via-[#7d273a] to-amber-700' : 'bg-muted'}`}
                >
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.imageAlt ?? ''}
                            className="absolute inset-0 size-full object-cover"
                        />
                    ) : (
                        <div
                            className="text-muted-foreground relative z-10 flex h-full items-center justify-center"
                            aria-label="No event image"
                        >
                            <ImageOff className="size-8" aria-hidden="true" />
                        </div>
                    )}
                    {event.imageUrl && (
                        <div
                            className="from-card via-card/70 pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r to-transparent"
                            aria-hidden="true"
                        />
                    )}
                </div>
            </Card>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-[#641b2e] dark:text-amber-100">
                            {event.title}
                        </DialogTitle>
                        <DialogDescription>
                            {event.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 text-sm">
                        <p>
                            <span className="font-semibold">Date:</span>{' '}
                            {event.date}
                        </p>
                        <p>
                            <span className="font-semibold">Time:</span>{' '}
                            {event.startTime} – {event.endTime}
                        </p>
                        <p>
                            <span className="font-semibold">Venue:</span>{' '}
                            {event.venue}
                        </p>
                    </div>
                    <DialogFooter>
                        {!isPassed && (
                            <Button
                                type="button"
                                onClick={() => downloadCalendarInvite(event)}
                                className="bg-[#641b2e] text-white hover:bg-[#4d1423]"
                            >
                                <CalendarPlus aria-hidden="true" />
                                Add to Calendar
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
