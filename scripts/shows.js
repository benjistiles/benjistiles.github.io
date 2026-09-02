const showData = [
    {
        date: 'July 3, 2026',
        datetime: '2026-07-03',
        startTime: '7:00 PM',
        title: 'Blackwood Jazz at Entre Nous',
        personnel: ['Sam Clauter — clarinet and vocals', 'TJ Edwardz — keys and vocals', 'Benji Stiles — bass'],
        address: '104 S Main Street, Greenville, SC',
        notes: 'Reservations encouraged. Ages 21 and over.'
    },
    {
        date: 'July 4, 2026',
        datetime: '2026-07-04',
        startTime: '11:30 AM',
        title: 'Audrey Adams Band at Olde Eight',
        personnel: ['Audrey Adams — guitar and vocals', 'Nathan Fowler — guitar and vocals', 'Braden Anderson — bass', 'Benji Stiles — drums'],
        address: '709 Swing About, Greenwood, SC',
        notes: 'Open to the public.'
    },
    {
        date: 'August 15–16, 2026',
        datetime: '2026-08-15',
        endDatetime: '2026-08-16',
        title: 'Worship Services at Parkview Church',
        address: 'Palm Coast, FL'
    },
    {
        date: 'August 22, 2026',
        datetime: '2026-08-22',
        startTime: '4:00 PM',
        endTime: '7:00 PM',
        title: 'Private Event',
        personnel: ['Olivia Van Goor — vocals and bandleader', 'Lisa Sung — keys', 'Jeff Shoup — drums', 'Benji Stiles — bass']
    }
];

const parseTime = (time = '12:00 AM') => {
    const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!match) return '00:00';
    let hour = Number(match[1]);
    const minute = match[2] || '00';
    if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minute}`;
};

const getEnd = (show) => {
    const endDate = show.endDatetime || show.datetime;
    if (show.endTime) return new Date(`${endDate}T${parseTime(show.endTime)}:00`);
    if (show.startTime) return new Date(new Date(`${show.datetime}T${parseTime(show.startTime)}:00`).getTime() + 2 * 60 * 60 * 1000);
    return new Date(`${endDate}T23:59:59`);
};

const sortedShows = showData
    .map((show) => ({ ...show, end: getEnd(show) }))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
const now = new Date();
const upcoming = sortedShows.filter((show) => show.end >= now);
const past = sortedShows.filter((show) => show.end < now).reverse();
const upcomingContainer = document.querySelector('[data-upcoming-shows]');
const pastContainer = document.querySelector('[data-past-shows]');
const dialog = document.querySelector('[data-show-dialog]');

const showTime = (show) => {
    if (show.startTime && show.endTime) return `${show.startTime}–${show.endTime}`;
    return show.startTime || '';
};

const createRow = (show) => {
    const row = document.createElement('button');
    row.className = 'show-row';
    row.type = 'button';
    row.innerHTML = `
        <span class="show-date">${show.date}</span>
        <span class="show-name">${show.title}</span>
        <span class="show-place">${show.address || 'Details available on request'}</span>
        <span class="show-arrow" aria-hidden="true">View</span>
    `;
    row.addEventListener('click', () => openShow(show));
    return row;
};

const renderGroup = (container, shows, emptyMessage) => {
    if (!container) return;
    if (!shows.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = emptyMessage;
        container.appendChild(empty);
        return;
    }
    shows.forEach((show) => container.appendChild(createRow(show)));
};

const openShow = (show) => {
    if (!dialog) return;
    dialog.querySelector('[data-show-date]').textContent = [show.date, showTime(show)].filter(Boolean).join(' · ');
    dialog.querySelector('[data-show-title]').textContent = show.title;

    const location = dialog.querySelector('[data-show-location]');
    location.textContent = show.address || '';
    location.hidden = !show.address;

    const notes = dialog.querySelector('[data-show-notes]');
    notes.textContent = show.notes || '';
    notes.hidden = !show.notes;

    const personnel = dialog.querySelector('[data-show-personnel]');
    personnel.innerHTML = '';
    (show.personnel || []).forEach((person) => {
        const item = document.createElement('li');
        item.textContent = person;
        personnel.appendChild(item);
    });
    personnel.closest('.show-dialog-section').hidden = !show.personnel?.length;

    dialog.querySelector('[data-calendar-download]').onclick = () => downloadCalendar(show);
    dialog.showModal();
};

const escapeIcs = (value = '') => String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

const dateStamp = (date) => date.replaceAll('-', '');

const downloadCalendar = (show) => {
    const timed = Boolean(show.startTime);
    let start;
    let end;
    if (timed) {
        start = `DTSTART:${dateStamp(show.datetime)}T${parseTime(show.startTime).replace(':', '')}00`;
        const endDate = show.endDatetime || show.datetime;
        const endTime = show.endTime || new Date(getEnd(show)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        end = `DTEND:${dateStamp(endDate)}T${parseTime(endTime).replace(':', '')}00`;
    } else {
        const dayAfter = new Date(`${show.endDatetime || show.datetime}T12:00:00`);
        dayAfter.setDate(dayAfter.getDate() + 1);
        start = `DTSTART;VALUE=DATE:${dateStamp(show.datetime)}`;
        end = `DTEND;VALUE=DATE:${dayAfter.toISOString().slice(0, 10).replaceAll('-', '')}`;
    }

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Benji Stiles//Performance Calendar//EN',
        'BEGIN:VEVENT',
        `UID:${show.datetime}-${show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@benjistilesmusic.com`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${escapeIcs(show.title)}`,
        start,
        end,
        show.address ? `LOCATION:${escapeIcs(show.address)}` : '',
        show.notes ? `DESCRIPTION:${escapeIcs(show.notes)}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
};

renderGroup(upcomingContainer, upcoming, 'No public dates are currently announced.');
renderGroup(pastContainer, past, 'Recent performance dates will appear here.');

if (dialog) {
    dialog.querySelector('[data-show-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
}
