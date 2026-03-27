export function calculateWorkedTime(st, et) {

    if(!st || !et) return "";

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

export const convertTo24Hour = (time12h) => {
  if (!time12h) return "";

  const [time, modifier] = time12h.split(" "); // ["03:15:00", "PM"]
  let [hours, minutes] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  }

  if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};