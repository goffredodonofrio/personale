// api/events.js
import ical from 'ical';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const urls = [
        "https://calendar.google.com/calendar/ical/36eed2a61qm05b8ubdpbkja2q0%40group.calendar.google.com/public/basic.ics",
        "https://calendar.google.com/calendar/ical/c_382bc406c1a43971525ab611419327202887f0807243694cae0bed37bcc9e774%40group.calendar.google.com/public/basic.ics"
    ];

    let events = [];

    for (const url of urls) {
        try {
            const data = await fetch(url).then(r => r.text());
            const parsed = ical.parseICS(data);

            for (let k in parsed) {
                const ev = parsed[k];
                if (ev.type === "VEVENT" && ev.start) {

                    events.push({
                        title: ev.summary || "Evento",
                        start: ev.start,
                        end: ev.end
                    });
                }
            }

        } catch (err) {
            console.error("Errore ICS:", err);
        }
    }

    // Filtra solo eventi di oggi
    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const eventsToday = events.filter(e => {
        const start = new Date(e.start);
        return start >= today && start < tomorrow;
    });

    // Ordine cronologico
    eventsToday.sort((a, b) => new Date(a.start) - new Date(b.start));

    res.status(200).json(eventsToday);
}
