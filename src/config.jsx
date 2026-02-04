
export const APP_NAME = "zenfirm"
const today = new Date();
export const formattedDate = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}-${today.getFullYear()}`;

export const CURRENTDATETIME = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
}).replace(',', '').replace(/\//g, "-")

console.log(CURRENTDATETIME);
// "02-04-2026 04:24:30 PM"
