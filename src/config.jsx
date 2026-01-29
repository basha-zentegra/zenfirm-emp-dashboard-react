
export const APP_NAME = "zenfirm"
const today = new Date();
export const formattedDate = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}-${today.getFullYear()}`;