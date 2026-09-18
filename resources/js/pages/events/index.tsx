import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { X } from 'lucide-react';
import { EventCalendar } from '@/components/event/event-calendar';
import { EventCard } from '@/components/event/event-card';
import { HighlightEventCard } from '@/components/event/highlight-event-card';
import { highlightedEvent, sampleEvents } from '@/pages/events/mock-data';

export default function EventsIndex() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dateFilteredEvents = selectedDate
        ? sampleEvents.filter((event) => event.dateKey === selectedDate)
        : sampleEvents;
    const upcomingEvents = dateFilteredEvents
        .filter((event) => event.dateKey >= todayKey)
        .sort((firstEvent, secondEvent) =>
            firstEvent.dateKey.localeCompare(secondEvent.dateKey),
        );
    const passedEvents = dateFilteredEvents
        .filter((event) => event.dateKey < todayKey)
        .sort((firstEvent, secondEvent) =>
            secondEvent.dateKey.localeCompare(firstEvent.dateKey),
        );

    return (
        <>
            <Head title="Upcoming Events" />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-8">
                <header className="space-y-2">
                    <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-400">
                        Campus calendar
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Upcoming Events
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Find out what is happening across the One Campus
                        community.
                    </p>
                </header>

                <section aria-label="Highlighted event">
                    <HighlightEventCard event={highlightedEvent} />
                </section>

                <section
                    aria-label="Upcoming events and event calendar"
                    className="grid gap-6 lg:grid-cols-10"
                >
                    <div className="space-y-6 lg:col-span-7">
                        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
                            <h2 className="text-xl font-semibold">
                                Upcoming Events
                            </h2>
                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(null)}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#641b2e] hover:bg-[#641b2e]/10 dark:text-amber-300 dark:hover:bg-amber-300/10"
                                >
                                    Clear date filter
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                        {selectedDate && (
                            <p className="text-muted-foreground text-sm">
                                Showing events for{' '}
                                {new Intl.DateTimeFormat('en', {
                                    dateStyle: 'long',
                                }).format(new Date(`${selectedDate}T00:00:00`))}
                            </p>
                        )}
                        {(upcomingEvents.length > 0 ||
                            passedEvents.length > 0) && (
                            <div className="space-y-6">
                                {upcomingEvents.length > 0 && (
                                    <section
                                        aria-labelledby="upcoming-events-heading"
                                        className="space-y-3"
                                    >
                                        {upcomingEvents.map((event) => (
                                            <EventCard
                                                key={`${event.dateKey}-${event.title}`}
                                                event={event}
                                            />
                                        ))}
                                    </section>
                                )}
                                {passedEvents.length > 0 && (
                                    <section
                                        aria-labelledby="passed-events-heading"
                                        className="space-y-3"
                                    >
                                        <h3
                                            id="passed-events-heading"
                                            className="text-lg font-semibold text-[#641b2e] dark:text-rose-300"
                                        >
                                            Passed events
                                        </h3>
                                        {passedEvents.map((event) => (
                                            <EventCard
                                                key={`${event.dateKey}-${event.title}`}
                                                event={event}
                                                isPassed
                                            />
                                        ))}
                                    </section>
                                )}
                            </div>
                        )}
                        {upcomingEvents.length === 0 &&
                            passedEvents.length === 0 && (
                                <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                                    No events are scheduled for this date.
                                </div>
                            )}
                    </div>

                    <aside
                        className="lg:col-span-3"
                        aria-label="Event date shortcuts"
                    >
                        <EventCalendar
                            events={sampleEvents}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                        />
                    </aside>
                </section>
            </main>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [{ title: 'Upcoming Events', href: '/events' }],
};
