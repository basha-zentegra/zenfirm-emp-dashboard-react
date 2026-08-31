import React, { useState,useEffect } from "react";
import { formattedDate } from "../../config";
import { useUser } from "../../context/UserContext";

// const holidays = [
//   {
//     date: "26",
//     month: "MAY",
//     name: "Memorial Day",
//     day: "Monday",
//   },
//   {
//     date: "19",
//     month: "JUN",
//     name: "Juneteenth",
//     day: "Thursday",
//   },
//   {
//     date: "04",
//     month: "JUL",
//     name: "Independence Day",
//     day: "Friday",
//   },
// ];

function getDate(dateString) {
  const [, day] = dateString.split("-");
  return day;
}

function getMonth(dateString) {
  const month = Number(dateString.split("-")[0]);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  return months[month - 1];
}

function getDay(dateString) {
    const [month, day, year] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", { weekday: "long" });
}


const UpcomingHolidays = () => {

    const {USERID} = useUser();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [holidays, setHolidays] = useState([]);

      useEffect(() => {
        const fetchUpcommingHolidays = async () => {
          try {
            const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Office_Holiday__List", criteria: `Date_field > '${formattedDate}' `})
    
            console.log("Upcomming holidays",res)
    
            if(res.code == 3000){
                // setAnnouncements(res.data);

                const newHoliday = res?.data?.map(e => ({
                    name: e?.Event_Name,
                    date: getDate(e?.Date_field),
                    month: getMonth(e?.Date_field),
                    day: getDay(e?.Date_field),
                }))

                setHolidays(newHoliday)
            }
    
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchUpcommingHolidays();
      }, []);

  const holiday = holidays[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === holidays.length - 1 ? 0 : prevIndex + 1
    );
  };

if (!holiday) {
  return (
    <div
      className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100 p-0"
      style={{ height: "100px" }}
    >
      <div className="card-header bg-white border-0 pb-0">
        <span
          className="ms-1 fw-medium"
          style={{
            fontSize: "14px",
            color: "#8593e8",
          }}
        >
          <i className="bi bi-calendar me-2"></i>
           Upcoming Holidays
        </span>
      </div>

      <div className="card-body pt-1">
        <span className="text-muted" style={{ fontSize: "13px" }}>
          No upcoming holidays
        </span>
      </div>
    </div>
  );
}

  return (
    <div
      className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100 mt-2 p-0"
      style={{ height: "100px" }}
    >
      {/* Header */}
      <div className="card-header bg-white border-0 pb-0">
        <span
          className="ms-1 fw-medium"
          style={{
            fontSize: "14px",
            color: "#8593e8",
          }}
        >
          <i className="bi bi-calendar me-1"></i>
          Upcoming Holidays
        </span>
      </div>

      {/* Body */}
      <div className="card-body pt-1">
        <div className="d-flex align-items-center justify-content-between">
          
          {/* Holiday */}
          <div className="d-flex align-items-center">
            
            {/* Date box */}
            <div
              className="text-center d-flex flex-column justify-content-center me-3"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "9px",
                backgroundColor:
                  currentIndex === 1 ? "#f5f4ff" : "#fff1f3",
                flexShrink: 0,
              }}
            >
              <span
                className="fw-bold"
                style={{
                  fontSize: "17px",
                  lineHeight: "18px",
                  color:
                    currentIndex === 1 ? "#4d5fc4" : "#e43d4f",
                }}
              >
                {holiday.date}
              </span>

              <span
                className="fw-semibold"
                style={{
                  fontSize: "11px",
                  color: "#555",
                }}
              >
                {holiday.month}
              </span>
            </div>

            {/* Holiday details */}
            <div>
              <div
                className="fw-semibold"
                style={{
                  fontSize: "14px",
                  color: "#222",
                }}
              >
                {holiday.name}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginTop: "2px",
                }}
              >
                {holiday.day}
              </div>
            </div>
          </div>

          {/* Next arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="btn border-0 d-flex align-items-center justify-content-center"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#f5f6ff",
              color: "#8593e8",
              flexShrink: 0,
            }}
            aria-label="Next holiday"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingHolidays;