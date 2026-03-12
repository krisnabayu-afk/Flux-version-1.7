import React, { useMemo, useEffect, useRef } from 'react';
import moment from 'moment';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const EventWrapper = ({ event, eventPropGetter, onSelectEvent }) => {
    const { style, className } = eventPropGetter(event) || {};

    return (
        <div
            className={`text-xs p-0 rounded cursor-pointer relative h-full w-full overflow-visible ${className || ''}`}
            style={{
                ...style,
                color: style?.color || 'white',
                backgroundColor: style?.backgroundColor || '#3174ad',
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (onSelectEvent) onSelectEvent(event);
            }}
            title={`${event.resource?.user_name || 'Event'} - ${event.resource?.title || ''}${event.resource?.site_name ? ` (${event.resource.site_name})` : ''}`}
        >
            <div className="sticky left-[132px] w-fit max-w-[calc(100%-132px)] h-full inline-flex flex-col justify-center px-2 py-1 overflow-hidden pointer-events-none">
                <span className="block font-semibold leading-tight truncate">
                    {event.resource?.site_name || (event.resource?.user_name || event.title)}
                </span>
                {event.resource?.site_name && (
                    <span className="block opacity-90 text-[10px] leading-tight truncate">
                        {event.resource?.user_name || event.title}
                    </span>
                )}
            </div>
        </div>
    );
};

const InvertedViewGrid = ({ date, events, days, localizer, onSelectEvent, onSelectSlot, eventPropGetter, dayPropGetter }) => {
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            // w-40 = 10rem = 160px. 09:00 is index 9. 9 * 160 = 1440px.
            scrollContainerRef.current.scrollLeft = 1440;
        }
    }, [date]); // Re-scroll to 9 AM when changing weeks/days

    // Memoize the time grid mapping to prevent excessive recalculations
    const gridData = useMemo(() => {
        const data = days.map((day) => {
            const dayStart = moment(day).startOf('day');
            const dayEnd = moment(day).endOf('day');

            // Filter events that fall on this day
            const dayEvents = events.filter((e) => {
                const eStart = moment(e.start);
                const eEnd = moment(e.end);
                return (eStart.isSameOrBefore(dayEnd) && eEnd.isSameOrAfter(dayStart));
            });

            // Calculate lanes for overlapping events
            const lanes = [];
            const dayEventsSorted = [...dayEvents].sort((a, b) => new Date(a.start) - new Date(b.start));

            dayEventsSorted.forEach(event => {
                const start = moment(event.start);
                const end = moment(event.end);
                let placed = false;
                for (const lane of lanes) {
                    const overlaps = lane.some(existingEvent => {
                        const existingStart = moment(existingEvent.start);
                        const existingEnd = moment(existingEvent.end);
                        // Add a small 1-minute buffer for overlap tolerance
                        return start.isBefore(existingEnd.clone().add(1, 'minutes')) && end.isAfter(existingStart.clone().subtract(1, 'minutes'));
                    });
                    if (!overlaps) {
                        lane.push(event);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    lanes.push([event]);
                }
            });

            return {
                date: day,
                lanes,
                dayStart // pass dayStart for math later
            };
        });
        return data;
    }, [days, events]);

    return (
        <div ref={scrollContainerRef} className="w-full h-full border border-border bg-card rounded-lg overflow-auto text-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50 [&::-webkit-scrollbar-thumb]:rounded-full relative scroll-smooth">
            <div className="flex flex-col min-w-max">
                {/* Header - Horizontal Time Slots */}
                <div className="flex border-b border-border bg-muted/50 sticky top-0 z-20">
                    <div className="w-32 flex-shrink-0 border-r border-border p-3 font-semibold text-foreground flex items-center justify-center sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_var(--border)]">
                        Date
                    </div>
                    <div className="flex flex-1">
                        {HOURS.map((hour) => (
                            <div key={hour} className="w-40 flex-shrink-0 border-r border-border p-2 text-center text-muted-foreground font-medium last:border-r-0">
                                {moment().hour(hour).minute(0).format('HH:mm')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body - Vertical Dates and Event Grid */}
                <div className="flex flex-col z-0">
                    {gridData.map((row, rowIndex) => {
                        const { style: dayStyle, className: dayClassName } = dayPropGetter ? dayPropGetter(row.date) : {};
                        return (
                            <div key={rowIndex}
                                className={`flex border-b border-border/60 min-h-[80px] hover:bg-muted/30 transition-colors group ${dayClassName || ''}`}
                                style={dayStyle}
                            >
                                <div className={`w-32 flex-shrink-0 border-r border-border p-3 text-foreground font-medium flex items-center justify-center sticky left-0 z-30 group-hover:bg-muted/20 shadow-[1px_0_0_0_var(--border)] ${dayClassName ? '' : 'bg-card'}`}
                                    style={dayStyle}
                                >
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{moment(row.date).format('ddd')}</div>
                                        <div className="text-lg">{moment(row.date).format('DD MMM')}</div>
                                    </div>
                                </div>

                                <div className="flex flex-1 relative min-w-max">
                                    {/* Background Grid Lines */}
                                    <div className="flex w-full absolute inset-0 pointer-events-none">
                                        {HOURS.map((hour) => (
                                            <div key={hour} className="w-40 flex-shrink-0 border-r border-border/50 h-full last:border-r-0"></div>
                                        ))}
                                    </div>

                                    {/* Event Lanes */}
                                    <div className="flex flex-col w-full relative z-10 py-2 px-1">
                                        {row.lanes.length === 0 ? (
                                            <div className="min-h-[64px]"></div>
                                        ) : (
                                            row.lanes.map((lane, laneIdx) => (
                                                <div key={laneIdx} className="relative min-h-[44px] w-full mb-1 last:mb-0">
                                                    {lane.map((event, idx) => {
                                                        const dayStart = row.dayStart;
                                                        const dayEnd = dayStart.clone().add(1, 'day');

                                                        const eStart = moment.max(dayStart, moment(event.start));
                                                        const eEnd = moment.min(dayEnd, moment(event.end));

                                                        const startMins = eStart.diff(dayStart, 'minutes');
                                                        const durationMins = eEnd.diff(eStart, 'minutes');

                                                        const left = startMins * (160 / 60);
                                                        const width = Math.max(durationMins * (160 / 60), 40); // min 40px width

                                                        return (
                                                            <div
                                                                key={`${event.id || idx}`}
                                                                className="absolute top-0 bottom-0 py-1 hover:z-20"
                                                                style={{ left: `${left}px`, width: `${width}px` }}
                                                            >
                                                                <div className="h-full w-full">
                                                                    <EventWrapper
                                                                        event={event}
                                                                        eventPropGetter={eventPropGetter}
                                                                        onSelectEvent={onSelectEvent}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Inverted Week View ---
export const InvertedWeekView = ({ date, localizer, events, onSelectEvent, onSelectSlot, eventPropGetter, dayPropGetter }) => {
    const days = useMemo(() => {
        let start = moment(date).startOf('week'); // Respects locale's start of week (Sunday or Monday)
        return Array.from({ length: 7 }, (_, i) => moment(start).add(i, 'days').toDate());
    }, [date]);

    return (
        <InvertedViewGrid
            date={date}
            days={days}
            events={events}
            localizer={localizer}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            eventPropGetter={eventPropGetter}
        />
    );
};

InvertedWeekView.title = (date, { localizer }) => {
    const start = moment(date).startOf('week');
    const end = moment(date).endOf('week');
    return `${start.format('MMMM DD')} - ${end.format('MMMM DD')}`;
};

InvertedWeekView.navigate = (date, action) => {
    switch (action) {
        case 'PREV':
            return moment(date).subtract(1, 'week').toDate();
        case 'NEXT':
            return moment(date).add(1, 'week').toDate();
        default:
            return date;
    }
};

// --- Inverted Day View ---
export const InvertedDayView = ({ date, localizer, events, onSelectEvent, onSelectSlot, eventPropGetter, dayPropGetter }) => {
    const days = [date]; // Only one day

    return (
        <InvertedViewGrid
            date={date}
            days={days}
            events={events}
            localizer={localizer}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            eventPropGetter={eventPropGetter}
        />
    );
};

InvertedDayView.title = (date) => {
    return moment(date).format('dddd, MMMM DD, YYYY');
};

InvertedDayView.navigate = (date, action) => {
    switch (action) {
        case 'PREV':
            return moment(date).subtract(1, 'day').toDate();
        case 'NEXT':
            return moment(date).add(1, 'day').toDate();
        default:
            return date;
    }
};
