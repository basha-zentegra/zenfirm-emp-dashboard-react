import React, { useState, useEffect, useCallback , useRef} from "react";
import { useUser } from "../../context/UserContext";

const WORK_MINUTES = 8 * 60;
const BREAK_ALLOWANCE_MINUTES = 60;
const OFFICE_END_HOUR = 22; // 10 PM

function fmt(mins) {
  mins = Math.max(0, Math.floor(mins));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function parseTimeTaken(str) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
  if (!match) return null;

  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);

  if (isNaN(h) || isNaN(m) || m > 59 || h < 0) return null;

  return h * 60 + m;
}

export default function WorkdayTracker({ input }) {
  const { USEROBJ } = useUser();

  const [now, setNow] = useState(new Date());
  const [timeTaken, setTimeTaken] = useState("");
  const [officeStart, setOfficeStart] = useState(null);


  const handleGateChange = useCallback((value) => {
    if (parseTimeTaken(value) !== null) {
      setTimeTaken(value);
    }
  }, []);

  const hasInitialized = useRef(false);

useEffect(() => {

    if(!input) return;

//   if (!hasInitialized.current && input) {
//     handleGateChange(input);
//     // hasInitialized.current = true;
//   }
  handleGateChange(input);
  setNow(new Date())

}, [input]);

  useEffect(() => {
    if (!USEROBJ?.Login_Time) return;

    const [datePart, timePart, ampm] = USEROBJ.Login_Time.split(" ");
    const [month, day, year] = datePart.split("-").map(Number);
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    setOfficeStart(
      new Date(year, month - 1, day, hours, minutes, seconds)
    );
  }, [USEROBJ]);

  if (!officeStart) {
    return null;
  }

//   console.warn("USEROBJ",USEROBJ)

  const officeEnd = new Date(now);
  officeEnd.setHours(OFFICE_END_HOUR, 0, 0, 0);

  let officeLeftMinutes = (officeEnd - now) / 60000;
  officeLeftMinutes = Math.max(0, Math.min(officeLeftMinutes, 9 * 60));


  let elapsedOfficeMinutes = Math.floor((now - officeStart) / 60000);

  elapsedOfficeMinutes = Math.max(0, elapsedOfficeMinutes);

  const takenMinutes = parseTimeTaken(timeTaken);
  const isInvalid = timeTaken.trim() !== "" && takenMinutes === null;

  let breakTakenMinutes = 0;
  let breakOverMinutes = 0;
  let percent = 0;

  let status = {color: "#8593EA"};

  if (takenMinutes !== null) {
    const workRemainingMinutes = Math.max(0, WORK_MINUTES - takenMinutes);

    breakTakenMinutes = Math.max(0,elapsedOfficeMinutes - takenMinutes);

    breakOverMinutes = Math.max(
      0,
      breakTakenMinutes - BREAK_ALLOWANCE_MINUTES
    );

    percent = Math.min(100, (takenMinutes / WORK_MINUTES) * 100);


    if (breakTakenMinutes > 60) {
      status = { color: "#EF4444" };
    } else if (breakTakenMinutes > 40) {
      status = { color: "#F59E0B" };
    } else if (breakTakenMinutes > 30) {
      status = { color: "rgb(239, 191, 68)" };
    } else if (breakTakenMinutes > 10) {
        status = { color: "#22C55E" };
    } else {
      status = { color: "#8593EA" };
    }

  } else if (isInvalid) {
    status = { color: "#3f3a3a" };
  }

  if (!officeStart) {
    return null;
  }


  console.log("breakTakenMinutes BETA", breakTakenMinutes, "now", now, "officeStart", officeStart)


  return (
    <div>
      <div>
        <small className="text-mute fw-semibold" style={status}>
          Break Taken: {fmt(breakTakenMinutes)} - (beta)

        </small>
      </div>
    </div>
  );
}
