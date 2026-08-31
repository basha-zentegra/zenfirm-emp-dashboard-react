// function reload(){
//     if(localStorage.getItem("Today")){
//       const t = localStorage.getItem("Today") 
//       if(t!==nowDateTime.split(" ")[0]){
//         localStorage.setItem("Today", nowDateTime.split(" ")[0])
//         location.reload()
//       }
//     }else{
//       localStorage.setItem("Today", nowDateTime.split(" ")[0])
//     }
// }

// function getTodayString() {
//   // Creates a reliable "YYYY-MM-DD" string based on the user's local time
//   const d = new Date();
//   return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
// }

// function checkAndReloadForNewDay() {
//   const today = getTodayString();
//   const lastVisit = localStorage.getItem("Today");

//   if (lastVisit && lastVisit !== today) {
//     // It's a new day! Update the date and reload immediately.
//     localStorage.setItem("Today", today);
//     location.reload();
//   } else {
//     // It's still the same day. 
//     // Set a timer to reload exactly at midnight tonight.
//     const now = new Date();
//     const midnight = new Date(now);
//     midnight.setHours(24, 0, 0, 0); // Sets time to 00:00:00 of the NEXT day

//     const msUntilMidnight = midnight - now;
    
//     setTimeout(() => {
//       checkAndReloadForNewDay(); // When midnight hits, run the check again
//     }, msUntilMidnight);
//   }
// }

// // Run it!
// // Also, make sure we store today's date if it's their very first visit
// if (!localStorage.getItem("Today")) {
//   localStorage.setItem("Today", getTodayString());
// }

// checkAndReloadForNewDay();


// const EIGHT_HOURS = 8 * 60 * 60 * 1000;
// const KEY = "appStartTime";

// if (!localStorage.getItem(KEY)) {
//   localStorage.setItem(KEY, Date.now());
// }

// function checkReload() {
//   const start = Number(localStorage.getItem(KEY));

//   if (Date.now() - start >= EIGHT_HOURS) {
//     localStorage.setItem(KEY, Date.now()); // reset timer
//     location.reload();
//   }
// }

// setInterval(checkReload, 60 * 1000);

// window.addEventListener("focus", checkReload);

// document.addEventListener("visibilitychange", () => {
//   if (!document.hidden) checkReload();
// });