/**
 * Helper to generate a Google Calendar "Add Event" URL
 * Automatically formats dates according to Google's ISO requirement
 * and sets Title, Location, and Description.
 */

export function buildGoogleCalendarUrl({ title, description, location, startDateIso, durationHours }) {
    // Google Calendar expects dates in the format YYYYMMDDTHHMMSSZ
    const formatDateForGoogle = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const start = formatDateForGoogle(startDateIso);

    // Calcula o horário final com base na duração informada
    let end = "";
    if (start && durationHours) {
        const endDate = new Date(startDateIso);
        endDate.setHours(endDate.getHours() + Number(durationHours));
        end = formatDateForGoogle(endDate.toISOString());
    } else if (start) {
        // Fallback para duração padrão de 1 hora se não for informado
        const endDate = new Date(startDateIso);
        endDate.setHours(endDate.getHours() + 1);
        end = formatDateForGoogle(endDate.toISOString());
    }

    const dates = start && end ? `${start}/${end}` : "";

    const params = new URLSearchParams();
    params.set('action', 'TEMPLATE');
    if (title) params.set('text', title);
    if (dates) params.set('dates', dates);
    if (description) params.set('details', description);
    if (location) params.set('location', location);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
