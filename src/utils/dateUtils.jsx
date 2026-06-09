export function parseEventDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [month, day, year] = dateStr.split("-").map(Number);

  let [timePart, meridian] = timeStr.split(" ");
  let [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (meridian.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  if (meridian.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
}


export function formatDateToMMDDYYYY(dateInput) {
    const date = new Date(dateInput);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
}



export function formatTimeToHHMM(dateInput) {
    const date = new Date(dateInput);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export function inputToMMDDYYYY(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${month}-${day}-${year}`;
}

export function MMDDYYYY_TO_YYYYMMDD(dateStr) {
  const [month, day, year] = dateStr.split("-");
  return `${year}-${month}-${day}`;
}

export function zohoToInput(dateString) {
  if (!dateString) return "";
  const [month, day, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const formattedToday = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;

export function isFuture(targetDate) {
  if (!targetDate) return false;

  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const today = parseDate(formattedToday);
  const target = parseDate(targetDate);

  return target > today;
}

export const startOfMonth = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-01-${d.getFullYear()}`;
};

export const endOfMonth = () => {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  return `${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(
    lastDay.getDate()
  ).padStart(2, "0")}-${lastDay.getFullYear()}`;
};

export function getMonthStartDate(dateString) {
  const [month, , year] = dateString.split("-");
  return `${month}-01-${year}`;
}

export const isFutureDate = (dateString) => {
  if (!dateString) return false;

  const [month, day, year] = dateString.split("-").map(Number);

  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignore time

  return inputDate > today;
};