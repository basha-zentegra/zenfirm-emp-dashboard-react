import {useEffect, useState, useMemo, useRef} from 'react'
import { APP_NAME } from '../../config'
import { formattedDate } from '../../config'
import { useUser } from '../../context/UserContext'



// const getNowDateTimeString = () => {
//   const now = new Date();

//   const day = String(now.getDate()).padStart(2, "0");
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const year = now.getFullYear();

//   let hours = now.getHours();
//   const minutes = String(now.getMinutes()).padStart(2, "0");
//   const seconds = String(now.getSeconds()).padStart(2, "0");

//   const meridian = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12;
//   hours = String(hours).padStart(2, "0");

//   return `${month}-${day}-${year} ${hours}:${minutes}:${seconds} ${meridian}`;
// };

const getNowDateTimeString = () => {
  const now = new Date();

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);

  const get = (type) => parts.find(p => p.type === type).value;

  return `${get("month")}-${get("day")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")} ${get("dayPeriod")}`;
};

const arrangePunches = (punch) => {
  const rows = [];
  let pendingIn = null;
  let pendingOut = null;

  punch.forEach(e => {
    if (e.Check === "In") {
      // If there is a previous IN without OUT
      if (pendingIn) {
        rows.push({
          inTime: pendingIn,
          outTime: "-"
        });
      }
      // Start new IN
      pendingIn = e.Punch_Time.slice(10);

      // If there was a pending OUT, attach it here
      if (pendingOut) {
        rows.push({
          inTime: pendingIn,
          outTime: pendingOut
        });
        pendingIn = null;
        pendingOut = null;
      }
    }

    else if (e.Check === "Out") {
      // Store OUT temporarily
      pendingOut = e.Punch_Time.slice(10);
    }
  });

  // Final cleanup
  if (pendingIn) {
    rows.push({
      inTime: pendingIn,
      outTime: "-"
    });
  } else if (pendingOut) {
    rows.push({
      inTime: "-",
      outTime: pendingOut
    });
  }

  return rows;
};


function calculateWorkedTime(startTime, endTime) {

    if (!startTime || !endTime) {
        return "-";
    }

    if (startTime === "-" || endTime === "-") {
        return "-";
    }

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes, seconds] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes, seconds);
  };

  const start = parseTime(startTime.trim());
  const end = parseTime(endTime.trim());

  let diffMs = end - start;

  // Handle case where end time is next day
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  // listofWorked.push(`${hours}h ${minutes}m`)

  return `${hours}h ${minutes}m`;
}


const timeStringToMinutes = (time) => {
  if (!time || time === "-") return 0;
  const [h, m] = time.split(" ");
  return parseInt(h) * 60 + parseInt(m);
};


function calculateWorkPercentage(timeString) {

    if (!timeString || timeString === "-") return 0;

  // Expected format: "8h 0m"
  const regex = /(\d+)h\s*(\d+)m/;
  const match = timeString.match(regex);

  if (!match) return 0;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  const totalMinutesWorked = hours * 60 + minutes;
  const fullDayMinutes = 8 * 60;

  const percentage = (totalMinutesWorked / fullDayMinutes) * 100;

  // Optional: cap between 0 and 100
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}


const sumWorkedTime = (times) => {

  if(times.length === 0){
    return "0h 0m";
  }

  let totalMinutes = 0;

  times.forEach(time => {


    if(time === "-"){
      return;
    }

    const [hPart, mPart] = time.split(" ");
    const hours = parseInt(hPart.replace("h", ""), 10);
    const minutes = parseInt(mPart.replace("m", ""), 10);

    totalMinutes += hours * 60 + minutes;
  });

  const finalHours = Math.floor(totalMinutes / 60);
  const finalMinutes = totalMinutes % 60;

  return `${finalHours}h ${finalMinutes}m`;
};


function getTimeDifference(startTime, endTime) {

  const parseDateTime = (dateTimeStr) => {

    const [datePart, timePart, meridian] = dateTimeStr.split(" ");
    const [month, day, year] = datePart.split("-").map(Number);
    let [hours, minutes, seconds] = timePart.split(":").map(Number);
    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes, seconds);

  };

  const startDate = parseDateTime(startTime);
  const endDate = parseDateTime(endTime);

  const diffMs = endDate - startDate;

  if (diffMs < 0) return "0h 0m";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}


//COMPONENT FUNCTION
const HomePunch = () => {

const {USERID, ORG} = useUser();

const [punch, setPunch] = useState([])


const [isIn, setIsIn] = useState(false)
const [currentInTime,setCurrentInTime] = useState(null)

const [liveDifference, setLiveDifference] = useState(null)

// const [worked, setWorked] = useState("0h 0m")
const [liveWorked, setLiveWorked] = useState(null);

 // ✅ Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


// ✅ Memoize arranged punches - only recalculates when punch changes
const arrangedPunches = useMemo(() => arrangePunches(punch), [punch]);

 // ✅ Memoize worked time calculation
const worked = useMemo(() => {
    return sumWorkedTime(arrangedPunches.map(e => calculateWorkedTime(e.inTime, e.outTime)));
}, [arrangedPunches]);

  // ✅ Memoize display value
  const displayWorked = useMemo(() => {
    return isIn && liveWorked ? liveWorked : worked || "0h 0m";
  }, [isIn, liveWorked, worked]);

  // ✅ Memoize percentage calculation
  const workPercentage = useMemo(() => {
    return calculateWorkPercentage(displayWorked);
  }, [displayWorked]);


  // Inside component:
const workedRef = useRef(worked);

// Keep ref in sync
useEffect(() => {
  workedRef.current = worked;
}, [worked]);

useEffect(() => {
  if (!isIn || !currentInTime) return;

  const interval = setInterval(() => {

    const nowDateTime = getNowDateTimeString();

    const baseWorkedMinutes = timeStringToMinutes(workedRef.current);
    console.log(currentInTime,nowDateTime);
    const liveDiff = getTimeDifference(currentInTime,nowDateTime);
    setLiveDifference(liveDiff)
    const liveMinutes = timeStringToMinutes(liveDiff);

    const totalMinutes = baseWorkedMinutes + liveMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;


    setLiveWorked(`${hours}h ${minutes}m`);
  }, 1000);

  return () => clearInterval(interval);
}, [isIn, currentInTime]);




 useEffect(() => {
    if (!USERID) return

     setLoading(true);
    setError(null);

    const config = {
      app_name: APP_NAME,
      report_name: "All_Punches",
      criteria: `Employee.ID==${USERID} && Punch_Time > "${formattedDate} 09:00:00 AM"`
    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

        if(response.code === 3000){
          console.log("Today's Punch Data:", response.data)
          const punchResult = response.data;
          setPunch(punchResult)

          if(response.data.length > 0 && response.data[0].Check === "In"){
            console.log("IM INNNNNNNNNNNNNNNNN")
            setIsIn(true)
            setCurrentInTime(response.data[0]?.Punch_Time)

          }

        } else{
          setError("Failed to fetch punch data");
        }
        
    })
    .catch((err) => {
            console.error(err);
            setError("No Punch-in Data Available");
    })
    .finally(() => {
            setLoading(false);
    });

  }, [USERID])




// Early returns for loading/error states
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-muted p-4">
        <img src="https://cdn-icons-png.flaticon.com/128/7486/7486747.png" alt="" />
        <br />
        <br />
        {error}
    </div>;
  }


  return (
    <>

        <div className='d-flex justify-content-center text-center'>
            <div className="card w-50 p-3 rounded-4" style={{background:"#f3fffc", border:"#139a74",boxShadow: "0 0 0 0.4px #139a74"}}>
              <p className='mb-2'>Hours Worked</p>
              <h4  className='fw-normal mb-2' style={{color:"#139a74"}}>{displayWorked}</h4>
              <div>
                  <div className="progress" style={{height:"10px"}}>
                      <div className="progress-bar progress-bar-striped bg-success" style={{ width: `${workPercentage}%` }}></div>
                  </div>
              </div>
            </div>
        </div>

{/* {liveDifference && (
    <p>{liveDifference} US Time issue Rectified</p> 
)}

{ORG && (<p>{ORG}</p>)} */}


        <table className='table'>
                <thead>
                    <tr>
                        <th className='text-center text-uppercase text-muted'>In</th>
                        <th className='text-center text-uppercase text-muted'>Out</th>
                        <th className='text-center text-uppercase text-muted'>Worked</th>
                    </tr>
                </thead>
                        
                <tbody>
                    {arrangedPunches.map((e, i) => (
                        <tr key={`${e.inTime}-${e.outTime}-${i}`}>
                        <td className='text-center'>{e.inTime}</td>
                        <td className='text-center'>{e.outTime}</td>
                        <td className='text-center workedtd'>
                            {calculateWorkedTime(e.inTime, e.outTime)}
                        </td>
                        </tr>
                    ))}
                </tbody>
        </table>

    </>
  )
}

export default HomePunch



