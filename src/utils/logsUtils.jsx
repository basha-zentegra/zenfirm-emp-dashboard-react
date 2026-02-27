export function calculateWorkedTime(st, et) {

    // Split hours and minutes
    const [sh, sm] = st.split(":").map(Number);
    const [eh, em] = et.split(":").map(Number);

    // Convert both times to total minutes
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    // Handle overnight case (e.g., 22:00 → 01:00)
    let diff = endMinutes - startMinutes;
    if (diff < 0) {
        diff += 24 * 60;
    }

    // Convert back to hours and minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m`;
}