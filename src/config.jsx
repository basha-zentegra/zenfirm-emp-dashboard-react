
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


export const TESTING_USERS = ["basha@zenfirm.app","manikandan@zenfirm.app", "faiyas@zenfirm.app", "mani@zenfirm.app", "akash@zenfirm.app", "sanket@zenfirm.app", "ajay@zenfirm.app", "bhagyaraj@zenfirm.app", "abdul@zenfirm.app", "srinivasa@zenfirm.app","nithish@zenfirm.app","rudresh@zenfirm.app"];