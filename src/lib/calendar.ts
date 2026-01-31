interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  duration?: number;
}

const formatDateTime = (date: string, time: string): string => {
  const eventDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);

  return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const formatDateTimeEnd = (date: string, time: string, durationMinutes: number = 120): string => {
  const eventDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);
  eventDate.setMinutes(eventDate.getMinutes() + durationMinutes);

  return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateICSFile = (event: CalendarEvent): string => {
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTimeEnd(event.startDate, event.startTime, event.duration);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YCA//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTimeEnd(event.startDate, event.startTime, event.duration);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startDateTime}/${endDateTime}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const getOutlookCalendarUrl = (event: CalendarEvent): string => {
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTimeEnd(event.startDate, event.startTime, event.duration);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDateTime,
    enddt: endDateTime
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const getYahooCalendarUrl = (event: CalendarEvent): string => {
  const eventDate = new Date(event.startDate);
  const [hours, minutes] = event.startTime.split(':').map(Number);
  eventDate.setHours(hours, minutes, 0, 0);

  const duration = event.duration || 120;
  const durationHours = Math.floor(duration / 60).toString().padStart(2, '0');
  const durationMinutes = (duration % 60).toString().padStart(2, '0');

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description,
    in_loc: event.location,
    st: formatDateTime(event.startDate, event.startTime),
    dur: `${durationHours}${durationMinutes}`
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};
