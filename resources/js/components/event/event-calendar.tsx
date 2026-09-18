import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CampusEvent } from '@/components/event/types';

type EventCalendarProps = {
    events: CampusEvent[];
    selectedDate: string | null;
    onSelectDate: (date: string | null) => void;
};

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function dateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function escapeCalendarText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function downloadCalendarInvites(events: CampusEvent[]): void {
    const calendar = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//One Campus//Events//EN',
        ...events.flatMap((event) => [
            'BEGIN:VEVENT',
            `DTSTART:${event.calendarStart}`,
            `DTEND:${event.calendarEnd}`,
            `SUMMARY:${escapeCalendarText(event.title)}`,
            `DESCRIPTION:${escapeCalendarText(event.description)}`,
            `LOCATION:${escapeCalendarText(event.venue)}`,
            'END:VEVENT',
        ]),
        'END:VCALENDAR',
    ].join('\\r\\n');
    const file = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'one-campus-events.ics';
    link.click();
    URL.revokeObjectURL(downloadUrl);
}

export function EventCalendar({ events, selectedDate, onSelectDate }: EventCalendarProps) {
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const initialDate = events[0]?.dateKey;

        return initialDate ? new Date(`${initialDate}T00:00:00`) : new Date();
    });
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarCells = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    const datesWithEvents = new Set(
        events
            .filter((event) => event.dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`))
            .map((event) => event.dateKey),
    );
    const visibleMonthEvents = events.filter((event) =>
        event.dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`),
    );
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const passedEventDates = new Set(
        events
            .filter((event) => event.dateKey < todayKey)
            .map((event) => event.dateKey),
    );

    function changeMonth(offset: number): void {
        setVisibleMonth(new Date(year, month + offset, 1));
        onSelectDate(null);
    }

    function selectMonthYear(nextYear: number, nextMonth: number): void {
        setVisibleMonth(new Date(nextYear, nextMonth, 1));
        onSelectDate(null);
    }

    return (
        <Card className="h-fit gap-4 py-5">
            <CardHeader className="flex-row items-center justify-between px-5">
                <CardTitle className="text-base">Event calendar</CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setVisibleMonth(new Date());
                        onSelectDate(null);
                    }}
                >
                    Today
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                    </button>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMonthPickerOpen((isOpen) => !isOpen)}
                            aria-expanded={isMonthPickerOpen}
                            aria-label="Choose month and year"
                            className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth)}
                        </button>
                        {isMonthPickerOpen && (
                            <div className="absolute top-full left-1/2 z-20 mt-2 grid w-56 -translate-x-1/2 gap-3 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg">
                                <label className="grid gap-1 text-xs font-medium">
                                    Month
                                    <select
                                        value={month}
                                        onChange={(event) => selectMonthYear(year, Number(event.target.value))}
                                        className="h-9 rounded-md border bg-background px-2 text-sm"
                                    >
                                        {Array.from({ length: 12 }, (_, index) => (
                                            <option key={index} value={index}>
                                                {new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2000, index, 1))}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="grid gap-1 text-xs font-medium">
                                    Year
                                    <select
                                        value={year}
                                        onChange={(event) => selectMonthYear(Number(event.target.value), month)}
                                        className="h-9 rounded-md border bg-background px-2 text-sm"
                                    >
                                        {Array.from({ length: 21 }, (_, index) => year - 10 + index).map((optionYear) => (
                                            <option key={optionYear} value={optionYear}>{optionYear}</option>
                                        ))}
                                    </select>
                                </label>
                                <Button type="button" size="sm" onClick={() => setIsMonthPickerOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Next month"
                    >
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekdays.map((weekday) => (
                        <span key={weekday} className="pb-1 text-xs font-medium text-muted-foreground">
                            {weekday}
                        </span>
                    ))}
                    {calendarCells.map((day, index) => {
                        if (!day) {
                            return <span key={`empty-${index}`} aria-hidden="true" />;
                        }

                        const key = dateKey(year, month, day);
                        const hasEvents = datesWithEvents.has(key);
                        const hasPassedEvents = passedEventDates.has(key);
                        const isSelected = selectedDate === key;

                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={!hasEvents}
                                onClick={() => onSelectDate(isSelected ? null : key)}
                                aria-pressed={isSelected}
                                aria-label={`${new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date(year, month, day))}${hasEvents ? ', has events' : ''}`}
                                className={`mx-auto flex size-8 items-center justify-center rounded-md text-xs transition-colors ${
                                    isSelected
                                        ? 'bg-amber-500 font-bold text-white ring-2 ring-amber-500/30'
                                        : hasPassedEvents
                                          ? 'bg-[#641b2e] font-semibold text-white hover:bg-[#7d273a] dark:bg-[#641b2e] dark:text-rose-100 dark:hover:bg-[#7d273a]'
                                          : hasEvents
                                          ? 'bg-amber-400 font-semibold text-[#451322] hover:bg-amber-300 dark:bg-amber-300 dark:text-[#451322] dark:hover:bg-amber-200'
                                          : 'text-muted-foreground/70'
                                } ${!hasEvents ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                        <span className="size-2.5 rounded-sm bg-amber-400" aria-hidden="true" />
                        Upcoming event
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="size-2.5 rounded-sm bg-[#641b2e]" aria-hidden="true" />
                        Past event
                    </span>
                </div>
                <Button
                    type="button"
                    className="w-full bg-[#641b2e] text-white hover:bg-[#4d1423]"
                    disabled={visibleMonthEvents.length === 0}
                    onClick={() => downloadCalendarInvites(visibleMonthEvents)}
                >
                    <CalendarPlus aria-hidden="true" />
                    Sync to calendar
                </Button>
            </CardContent>
        </Card>
    );
}
