import {useState,useEffect} from "react";
import { useUser } from "../../context/UserContext";
import { startOfMonth } from "../../utils/dateUtils";

const LeaveBalanceCard = ({setError}) => {

      const {USERID} = useUser()
      const [currentData, setCurrentData] = useState({});
  
      useEffect(()=>{

          function fetchLeaveHistory(){

              const config2 = {
                      report_name: "Leave_History_Report",
                      criteria: `Leave_Balance_Form.Employee==${USERID} && Month_field == '${startOfMonth()}'`
              }

              ZOHO.CREATOR.DATA.getRecords(config2).then((response) => {
              
                console.log("Leave History Report:", response)
                  if(response.code === 3000){
                      setCurrentData(response.data[0])
                      setError(false)
                      
                  }
              
              }).catch((err) =>{

                console.error(err)
                setError(true)

              } )
          }
  
          fetchLeaveHistory()
  
      },[])



  const data = [
    {
      title: "Casual Leave",
      used: currentData?.Used_Casual_Leave,
      total: currentData?.Eligible_Casual_Leave,
      icon: "bi-umbrella",
      bg: "bg-primary-subtle",
      iconColor: "text-primary",
      bal: currentData?.Balance_Casual_Leave
    },
    {
      title: "Sick Leave",
      used: currentData?.Used_Sick_Leave,
      total: currentData?.Eligible_Sick_Leave,
      icon: "bi-thermometer-half",
      bg: "bg-danger-subtle",
      iconColor: "text-danger",
      bal: currentData?.Balance_Sick_Leave
    },
  ];



  return (
    <div className="container py-4">
      <div className="row g-4">
        {data.map((item, index) => (
          <div className="col-md-6" key={index}>
            <div
              className="card border-0 shadow-sm h-100 p-3"
              style={{
                borderRadius: "16px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div className="d-flex align-items-center mb-3">
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle ${item.bg}`}
                  style={{ width: "50px", height: "50px" }}
                >
                  <i
                    className={`bi ${item.icon} fs-4 ${item.iconColor}`}
                  ></i>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <h6 className="text-muted text-uppercase fw-semibold mb-2">
                    {item.title} - 
                </h6>
                <h4 className="fs-4 ms-2 fw-bold">{item.bal || 0}</h4>
              </div>

              <div className="d-flex align-items-end mt-2">
                <h5 className="fw-bold mb-0 me-2">{item.used}</h5>
                <span className="text-muted">/ {item.total} Days</span>
              </div>

              {/* Progress Bar */}
              <div className="progress mt-3" style={{ height: "6px" }}>
                <div
                  className={`progress-bar ${item.iconColor.replace(
                    "text",
                    "bg"
                  )}`}
                  role="progressbar"
                  style={{
                    width: `${(item.used / item.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceCard;