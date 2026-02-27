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

export function zohoToInput(dateString) {
  if (!dateString) return "";
  const [month, day, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

export function isFuture(todayDate, targetDate) {
  if (!todayDate || !targetDate) return false;

  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const today = parseDate(todayDate);
  const target = parseDate(targetDate);

  return target > today;
}