import React, { useState, useEffect, useCallback , useRef} from "react";
import { useUser } from "../../context/UserContext";

const WORK_MINUTES = 8 * 60;
const BREAK_ALLOWANCE_MINUTES = 60;
const OFFICE_END_HOUR = 22; // 10 PM

function getIndianTime() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );
}

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

  const [now, setNow] = useState(getIndianTime());
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
  setNow(getIndianTime())

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
  let bg = { backgroundColor: "#E8EBFC" };

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
      bg = { backgroundColor: "#FEE2E2" };
    } else if (breakTakenMinutes > 40) {
      status = { color: "#F59E0B" };
      bg = { backgroundColor: "#FEF3C7" };
    } else if (breakTakenMinutes > 30) {
      status = { color: "rgb(239, 191, 68)" };
      bg = { backgroundColor: "#FEF9C3" };
    } else if (breakTakenMinutes > 10) {
        status = { color: "#55CCA6" };
        bg = { backgroundColor: "#DDF7EE" };
    } else {
      status = { color: "#8593EA" };
      bg = { backgroundColor: "#E8EBFC" };
    }

  } else if (isInvalid) {
    status = { color: "#3f3a3a" };
  }

  if (!officeStart) {
    return null;
  }


  // console.log("breakTakenMinutes BETA", breakTakenMinutes, "now", now, "officeStart", officeStart)


  return (
    <div className="d-flex justify-content-center mt-2">
      <div className="card w-50  border-0 rounded-4 py-1" style={bg}>
        <small className="fw-semibold" style={status}>
          <span className=""><i className="bi bi-cup-hot-fill me-2"></i> </span> Break Taken: {fmt(breakTakenMinutes)}

        </small>
      </div>


    </div>
  );
}
