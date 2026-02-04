import {useEffect, useState, useMemo} from 'react'
import { APP_NAME, CURRENTDATETIME } from '../../config'
import { formattedDate } from '../../config'
import { useUser } from '../../context/UserContext'




const HomePunch = () => {

const {USERID} = useUser();

const [punch, setPunch] = useState([])


const [isIn, setIsIn] = useState(false)
const [currentInTime,setCurrentInTime] = useState(null)

const [worked, setWorked] = useState("0h 0m")


 useEffect(() => {
    if (!USERID) return

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
          console.log(response)
        }
        
      })
      .catch((err) => console.error(err))

  }, [USERID])



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
    const [day, month, year] = datePart.split("-").map(Number);
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

 
// setWorked(sumWorkedTime(arrangePunches(punch).map((e, i) => (calculateWorkedTime(e.inTime,e.outTime)))) || "I think error" )

useEffect(() => { 
  const workedTime = sumWorkedTime(arrangePunches(punch).map(e =>calculateWorkedTime(e.inTime, e.outTime)));
  setWorked(workedTime);
}, [punch]);


  return (
    <>

        <div className='d-flex justify-content-center text-center'>
            <div className="card w-50 p-3 rounded-4" style={{background:"#f3fffc", border:"#139a74",boxShadow: "0 0 0 0.4px #139a74"}}>
            <p className='mb-2'>Hours Worked</p>
            <h4  className='fw-normal mb-2' style={{color:"#139a74"}}>{worked || "0h 0m"}</h4>
            <div >
                <div className="progress" style={{height:"10px"}}>
                <div className="progress-bar progress-bar-striped bg-success" 
                    style={{ width: `${calculateWorkPercentage(worked)}%` }}
                    ></div>
                </div>
            </div>
            </div>
            
        </div>

        {isIn && currentInTime && CURRENTDATETIME &&  (

            <div>
                {getTimeDifference(currentInTime,CURRENTDATETIME)}
            </div>

        )}

        <table className='table'>
                <thead>
                    <tr>
                        <th className='text-center text-uppercase text-muted'>In</th>
                        <th className='text-center text-uppercase text-muted'>Out</th>
                        <th className='text-center text-uppercase text-muted'>Worked</th>
                    </tr>
                </thead>
                        
                <tbody>
                    {arrangePunches(punch).map((e, i) => (
                        <tr key={i}>
                            <td className='text-center'>{e.inTime}</td>
                            <td className='text-center'>{e.outTime}</td>
                            <td className='text-center workedtd'>{calculateWorkedTime(e.inTime,e.outTime)}</td>
                        </tr>
                    ))}
                </tbody>
        </table>

    </>
  )
}

export default HomePunch



