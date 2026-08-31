import {useState, useEffect} from "react";
import "../../css/Timesheet.css"
import { useUser } from "../../context/UserContext";

function getCurrentWeek() {
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diffToMonday);

  const week = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    week.push({
      date: `${month}-${day}-${year}`,
      day: date.toLocaleDateString("en-US", {
        weekday: "short"
      })
    });
  }

  return week;
}


function getCurrentWeekDates() {
  const today = new Date();

  const day = today.getDay();

  // Calculate Monday
  const monday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diffToMonday);

  // Calculate Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  };

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday)
  };
}

const { startDate, endDate } = getCurrentWeekDates();

function getDay(dateString) {
  const [month, day, year] = dateString.split("-");

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "short"
  });
}


const timesheetDataTest = [
  { day: "Mon", hours: 2, status: "logged" },
  { day: "Tue", hours: 9.4, status: "logged" },
  { day: "Wed", hours: 7.8, status: "logged" },
  { day: "Thu", hours: 10, status: "logged" },
  { day: "Fri", hours: 5, status: "logged" },
  { day: "Sat", hours: 3.8, status: "upcoming" },
  { day: "Sun", hours: 1.8, status: "upcoming" },
];

// && Date_field >= '${startDate}' && Date_field <= '${endDate}'

const MAX_HOURS = 10;

const Timesheet = () => {

    const {USERID} = useUser();

    const [timesheetData, setTimesheetData] = useState([])

        useEffect(() => {

            if(!USERID) return;

          const fetchTimelogs = async () => {
            try {
              const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Timesheets_Report1", criteria: `Employee==${USERID}`})
      
            //   console.log("Timesheet Reprort",res) 
      
              if(res.code == 3000){
                //   setAnnouncements(res.data);
                // console.log(res.data.slice(0,6))

                // const mydata = res.data.slice(0,6).map(e => ({
                //     day: getDay(e.Date_field),
                //     hours: Number(e.Total_Hours),
                //     status: "logged"

                // }))
const week = getCurrentWeek();

const mydata = week.map(weekDay => {
  const record = res.data.find(e => e.Date_field === weekDay.date );

  return {
    day: weekDay.day,
    date: weekDay.date,
    hours: record ? Number(record.Total_Hours) : 0,
    status: record ? "logged" : "empty"
  };
});

setTimesheetData(mydata);


                // console.log(mydata)

                // setTimesheetData(mydata.reverse())
              }
      
            } catch (err) {
              console.error(err);
            }
          };
      
          fetchTimelogs();

        }, [USERID]);

  return (
    <div className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100">

      <div className="card-header bg-white border-0 pb-1">        
        <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#8593e8"}}><i class="bi bi-calendar3-week me-1"></i> Weekly Timesheet </span>
      </div>

      {/* Total */}
      {/* <div className="timesheet-summary">
        <div className="total-hours">32h 30m</div>
        <div className="logged-label">Logged</div>
      </div> */}

      {/* Chart */}
      <div className="chart-wrapper">
        <div className="chart-area">
          {/* Horizontal grid lines */}
          <div className="grid-line line-10">
            <span>10h</span>
          </div>

          <div className="grid-line line-5">
            <span>5h</span>
          </div>


          {/* Bars */}
          <div className="bars">
            {timesheetData.map((item,i) => {
              const height = `${(item.hours / MAX_HOURS) * 100}%`;

              return (
                <div className="bar-column" key={i}>
                  <div className="bar-container">
                    <div
                      className={`time-bar ${item.status}`}
                      style={{ height }}
                      title={`${item.hours} hours`}
                    />
                  </div>

                  <span className="day-label">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Timesheet;