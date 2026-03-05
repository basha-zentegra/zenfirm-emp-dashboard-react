import {useMemo, useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext'
import Stopwatch from '../timer/Stopwatch';
import { formattedDate } from '../../config';
import { isFuture } from '../../utils/dateUtils'; 
import { calculateWorkedTime } from '../../utils/logsUtils';
import EditTask from './EditTask';

const OffcanvasTaskDetails = ({selectedEvent, setSelectedEvent, setEvents, admin=false, fetchTasks }) => {

  const {userEmail, USERID} = useUser();

  const project = selectedEvent?.Project_Name;

  const account = selectedEvent?.["Project_Name.Accounts"];


  // Compute base URL safely
  const baseUrl = useMemo(() => {
    if (!userEmail) return null;

    if (userEmail.includes("@zentegra")) {
      return "https://creatorapp.zoho.in/zentegraindia/zenfirm/#Page:All_Projects?pid=";
    }

    return "https://zenfirm.zohocreatorportal.in/zentegraindia/zenfirm/#Page:All_Projects?pid="; 
  }, [userEmail]);


  const baseAccountUrl = useMemo(() => {
    if (!userEmail) return null;

    if (userEmail.includes("@zentegra")) {
      return "https://creatorapp.zoho.in/zentegraindia/zenfirm/#Page:Account_View?recordID=";
    }

    return "https://zenfirm.zohocreatorportal.in/zentegraindia/zenfirm/#Page:Account_View?recordID="; 
  }, [userEmail]);



  const projectUrl = project?.ID && baseUrl ? `${baseUrl}${project.ID}` : null;

  const accountUrl = account?.ID && baseAccountUrl ? `${baseAccountUrl}${account.ID}` : null;

  //Account_Name
  //#Page:Account_View?recordID=


  const [showAction, setShowAction] = useState(false);

  const [isFutureTask, setIsFutureTask] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showCompleteBtn, setShowCompleteBtn] = useState(true)

  const [isEdit, setEdit] = useState(false);

  const [logs, setLogs] = useState([]);
  const [showManualRow, setShowManualRow] = useState(false);

  const [manualLog, setManualLog] = useState({
    Date_field: new Date().toISOString().split("T")[0],
    Work_Started: "",
    Work_Ended: ""
  });

  function addManualLogs() {
    setShowManualRow(prev => !prev);
  }


  useEffect(() => {
    if (selectedEvent?.Task_Status === "Completed" || selectedEvent?.Task_Status === "Approved") {
      setShowAction(false);
    } else {
      setShowAction(true);
    }

    setLogs(selectedEvent?.Logs || [])

  }, [selectedEvent]);

  useEffect(() => {
    if(isFuture(formattedDate, selectedEvent?.Task_Date)){
      setShowCompleteBtn(false)
    } else{
      setShowCompleteBtn(true)
    }
  },[selectedEvent])

  useEffect(() => {
    if(selectedEvent?.Task_Date === formattedDate){
      setShowTimer(true)
    } else{
      setShowTimer(false)
    }
  },[selectedEvent])


    function completeTask() {
      const payload = {
        Task_Status: "Completed",
      };
  
      var config = {
        report_name: "Task_Report",
        id: selectedEvent.ID,
        payload: { data: payload },
      };
  
      ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
          if (response.code == 3000) {
            console.log("Task Completed:", response);
            // ✅ Immediately update UI
            setSelectedEvent(prev => ({
              ...prev,
              Task_Status: "Completed"
            }));

            setEvents(prev => prev.map(e => (e.id === selectedEvent.ID ? { ...e, taskStatus: "Completed" } : e)));


          } else {
            console.log("Update error:", response);
          }
        })
        .catch((e) => console.log(e));
    }

const [formData, setFormData] = useState({
  Date_field: "",
  Work_Started: "",
  Work_Ended: ""
});

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = () => {
  console.log(formData);

  setFormData({
    Date_field: "",
    Work_Started: "",
    Work_Ended: ""
  });
};

function submitManualLog() {
  const { Date_field, Work_Started, Work_Ended } = manualLog;

  if (!Date_field || !Work_Started || !Work_Ended) {
    alert("All fields mandatory");
    return;
  }
  const now = new Date();
  const selectedStart = new Date(`${Date_field}T${Work_Started}`);
  const selectedEnd = new Date(`${Date_field}T${Work_Ended}`);
  if (selectedStart > now || selectedEnd > now) {
    alert("Future time not allowed");
    return;
  }
  if (selectedEnd <= selectedStart) {
    alert("End must be greater");
    return;
  }
  if (isOverlapping(Date_field, selectedStart, selectedEnd)) {
    alert("Overlapping time");
    return;
  }
  const Hours_Worked = calculateWorkedTime(Work_Started, Work_Ended);
  const newLog = {
    Date_field,
    Work_Started,
    Work_Ended,
    Hours_Worked
  };
  // ✅ Update state instead of innerHTML
  setLogs(prev => [...prev, newLog]);

  setShowManualRow(false);
}

function isOverlapping(date, newStart, newEnd) {
  return logs.some(log => {
    if (log.date !== date) return false;

    const existingStart = new Date(`${date}T${log.st}`);
    const existingEnd = new Date(`${date}T${log.et}`);

    return newStart < existingEnd && newEnd > existingStart;
  });
}

// const totalWorked = useMemo(() => {
//   let totalMinutes = 0;

//   logs.forEach(log => {
//     const match = log.worked.match(/(\d+)h\s+(\d+)m/);
//     if (!match) return;

//     totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2]);
//   });

//   const h = Math.floor(totalMinutes / 60);
//   const m = totalMinutes % 60;

//   return `${h}h ${m}m`;
// }, [logs]);

// useEffect(() => {
//   const allocatedMinutes = convertToMinutes(allocatedTime);
//   const workedMinutes = convertToMinutes(totalWorked);

//   if (workedMinutes > allocatedMinutes) {
//     console.log("Overtime");
//     // Call Zoho update here
//   }
// }, [totalWorked]);
//Handle submit has to add with api post...


  return (
    <>
<div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
  <div className="offcanvas-header pb-0">


    {showAction && !admin && (
      <div className='d-flex w-100 justify-content-between align-items-center'>
        <div className='card w-2 p-2 px-3 rounded-3 d-inline g-3'>

        {showCompleteBtn && (
          <i onClick={completeTask} class="bi bi-check-square-fill fs-5 text-success me-4 cursor-pointer"></i>

        )}

          <i onClick={() => setEdit(prev => !prev)}  class="bi bi-pencil-fill text-primary fs-5 me-4 cursor-pointer"></i>
          <i className='bi bi-trash text-danger fs-5'></i>
        </div>

        <div>

        {showTimer && (
          <Stopwatch />
        )}
          

        </div>

      </div>
    )}


  </div>
  <div className="offcanvas-body">
   


<div className="card">
  <div className="card-body">
    <div className='text-end' style={{position:"absolute", top:"15px", right:"15px"}}>
          <button id='taskdetailsclsbtn' type="button"  className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>

      </div>
    

    {!isEdit && (
        <section>

    <div className="py-2 mb-2">
      <h5 className="text-primary">Task Details</h5>
    </div>

    <table className="table table-borderless" style={{ tableLayout: "fixed" }}>
      <tbody>
        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-clipboard-check"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Task Name
          </th>
          <td style={{ width: "58%" }}>
            <span >{selectedEvent?.Task_Name || " "}</span>
          </td>
        </tr>
        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-card-heading"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Project
          </th>
          <td style={{ width: "58%" }}>


            {projectUrl ? (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-zen fw-medium"
              >
                {project.Project_Name}
              </a>
              ) : (
                <span className="text-muted">No Project</span>
            )}


          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-building"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Account
          </th>
          <td style={{ width: "58%" }}>
           
           {accountUrl ? (
              <a
                href={accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-zen fw-medium"
              >
                {account.Account_Name}
              </a>
              ) : (
                <span className="text-muted">No Account</span>
            )}

          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-chat-left"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Description
          </th>
          <td style={{ width: "58%" }}>
            <span >{selectedEvent?.Task_Description || "No Description"}</span>
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-record-circle"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Status
          </th>
          <td id="taskStatusTD" style={{ width: "58%" }}>
            <span className={`bg-status  ${selectedEvent?.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{selectedEvent?.Task_Status || "Not Started"}</span>
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-calendar-check"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Task Date
          </th>
          <td id="startDate" style={{ width: "58%" }}>
            {selectedEvent?.Task_Date || "No Date"}
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-clock"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Time
          </th>
          <td id="endDate" style={{ width: "58%" }}>
            <span id="crtTime-266830000001194162">
              {selectedEvent?.Start_Time || " "} - {selectedEvent?.End_Time || " "}
            </span>
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-hourglass-split"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Budgeted Time
          </th>
          <td
            id="allocatedTime-266830000001194162"
            style={{ width: "58%" }}
          >
            {selectedEvent?.Budgeted_Time || "-"}
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-stopwatch"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Total Time Worked
          </th>
          <td
            id="totalTime-266830000001194162"
            style={{ width: "58%" }}
          >
            {selectedEvent?.Total_Worked || " "}
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-flag"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Priority
          </th>
          <td
            style={{ width: "58%" }}
            id="prio-td-266830000001194162"
          >
            <span className={`bg-status my-3 fw-bold cursor-pointer ${selectedEvent?.Task_Priority.toLowerCase() || "low"} `}>
              {selectedEvent?.Task_Priority || "Low"}
            </span>
          </td>
        </tr>
        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-person"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Assignee
          </th>
          <td style={{ width: "58%" }}>{selectedEvent?.Assignee?.Name || " "}</td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i class="bi bi-person-check"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Assigned By

          </th>
          <td style={{ width: "58%" }}>{selectedEvent?.Assigned_by?.Name || " "}</td>
        </tr>
      </tbody>
    </table>


        </section>
    )}

    {isEdit && (
      <section>
       

       <EditTask selectedEvent={selectedEvent} setEdit={setEdit} fetchTasks={fetchTasks} />



      </section>
    )}
   
  </div>
</div>

<div className="card mt-4">
  <div className="card-body">
    <div className="py-2 mb-2">
      <h5 className="text-primary">Logs <button className='btn btn-sm d-none' onClick={addManualLogs}>Add</button></h5>
    </div>

            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td>{log.Date_field}</td>
                      <td>{log.Work_Started}</td>
                      <td>{log.Work_Ended}</td>
                      <td>{log.Hours_Worked}</td>
                    </tr>
                  ))}

{showManualRow && (
  <tr>
    <td>
      <input
        type="date"
        className='form-control'
        max={new Date().toISOString().split("T")[0]}
        value={manualLog.Date_field}
        onChange={(e) =>
          setManualLog({ ...manualLog, Date_field: e.target.value })
        }
      />
    </td>

    <td>
      <input
        type="time"
        className='form-control'

        value={manualLog.Work_Started}
        onChange={(e) =>
          setManualLog({ ...manualLog, Work_Started: e.target.value })
        }
      />
    </td>

    <td>
      <input
        type="time"
        className='form-control'

        value={manualLog.Work_Ended}
        onChange={(e) =>
          setManualLog({ ...manualLog, Work_Ended: e.target.value })
        }
      />
    </td>

    <td>
      <button className='btn btn-sm' onClick={submitManualLog}>Submit</button>
    </td>
  </tr>
)}

                </tbody>
              </table>
            </div>



  </div>
</div>

  </div>
</div>
    
    
    </>
  )
}

export default OffcanvasTaskDetails