import {useMemo} from 'react'
import { useUser } from '../../context/UserContext'
import Stopwatch from '../timer/Stopwatch';

const OffcanvasTaskDetails = ({selectedEvent}) => {

  const {userEmail, USERID} = useUser();

  const project = selectedEvent?.Project_Name;

  // Compute base URL safely
  const baseUrl = useMemo(() => {
    if (!userEmail) return null;

    if (userEmail.includes("@zentegra")) {
      return "https://creatorapp.zoho.in/zentegraindia/zenfirm/#Page:All_Projects?pid=";
    }

    return "https://zenfirm.zohocreatorportal.in/zentegraindia/zenfirm/#Page:All_Projects?pid="; 
  }, [userEmail]);

  const projectUrl = project?.ID && baseUrl ? `${baseUrl}${project.ID}` : null;


  

  return (
    <>
<div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
  <div className="offcanvas-header pb-0">

    <div className='d-flex w-100 justify-content-between pe-4 align-items-center'>
      <h5 className="offcanvas-title" id="taskOffcanvasLable">{selectedEvent?.Task_Name || " "}</h5>
      <div>
        
        {/* <CountdownTimer /> */}
        <Stopwatch />
      </div>
    </div>

    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div className="offcanvas-body">
   


<div className="card">
  <div className="card-body">
    <div className="py-2 mb-2">
      <h5 className="text-primary">Task Details</h5>
    </div>

    <table className="table table-borderless" style={{ tableLayout: "fixed" }}>
      <tbody>
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
                className="text-decoration-none text-dark"
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
            <i className="bi bi-chat-left"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Description
          </th>
          <td style={{ width: "58%" }}>
            <span id="crtDesc-266830000001194162">{selectedEvent?.Task_Description || "No Description"}</span>
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
      </tbody>
    </table>
  </div>
</div>

  </div>
</div>
    
    
    </>
  )
}

export default OffcanvasTaskDetails