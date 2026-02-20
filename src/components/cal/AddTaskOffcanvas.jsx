import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { formattedDate } from '../../config';
import { APP_NAME } from '../../config';

const AddTaskOffcanvas = ({startEnd, setEvents}) => {
  const {USERID, projects} = useUser();

  const myProjects = projects || [];

  const [isSubmitting, setIsSubmitting] = useState(false);


  // console.log(startEnd.start, startEnd.end,USERID )

    function formatDateToMMDDYYYY(dateInput) {
      if(!dateInput){
        return;
      }
        const date = new Date(dateInput);

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();

        return `${month}-${day}-${year}`;
    }
  function formatTimeToHHMM(dateInput) {

      if(!dateInput){
        return;
      }
        const date = new Date(dateInput);

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
  }

  // const {USERID} = useUser();

  const [taskData, setTaskData] = useState({
    Task_Name: "",
    Task_Description: "",
    Task_Status: "Not Started",
    Task_Priority: "Low",
    Project_Name: "",
    Start_Time: formatTimeToHHMM(startEnd.start),
    End_Time:  formatTimeToHHMM(startEnd.end),
    Task_Date: formatDateToMMDDYYYY(startEnd.start),
    Assignee: USERID,
  });

  // console.log(taskData)

  // console.log("projects",myProjects.length)
  const selectedProject = myProjects?.find((p) => p.ID === taskData.Project_Name);




  const projectName = selectedProject?.Project_Name;


   // 🔥 Sync when startEnd changes
  useEffect(() => {
    if (startEnd?.start && startEnd?.end) {
      setTaskData((prev) => ({
        ...prev,
        Start_Time: formatTimeToHHMM(startEnd.start),
        End_Time: formatTimeToHHMM(startEnd.end),
        Task_Date: formatDateToMMDDYYYY(startEnd.start),
      }));
    }
  }, [startEnd]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeOffCanvas = () => {
    const element = document.getElementById("addtaskoffcanvas");
    const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(element);
    bsOffcanvas?.hide();

  }


  function addEvent() {
      var config = {
          app_name: APP_NAME,
          form_name: "Task",
          payload: {
              data: taskData
          }
      };
      ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
          if (response.code == 3000) {
              console.log(response);
              console.log(taskData)
              const newEvent = {
                id: response.data.ID,
                title:taskData.Task_Name,
                start:startEnd.start,
                end:startEnd.end,
                priority: taskData.Task_Priority.toLowerCase(),
                projectName: projectName,
              };
              setEvents(prev => [...prev, newEvent]);
              setTaskData((prev) => ({
                ...prev,
                Task_Name: "",
                Task_Description: "",
                Project_Name: ""
              }));
              closeOffCanvas()
              setIsSubmitting(false)

          } else{
            console.log(response);
          }
      }).catch(e => console.log(e))
  }

  const handleSubmit = () => {

    if(!taskData.Task_Name){
      alert("Task Name is Mandatory")
      return
    }
    setIsSubmitting(true); // 🔒 disable button
    addEvent()
  }

  return (
    <>
<div className="offcanvas offcanvas-end" tabIndex="-1" id="addtaskoffcanvas" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
  <div className="offcanvas-header">
    <h5 className="offcanvas-title" id="taskOffcanvasLable"></h5>
    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div className="offcanvas-body">
   

<div className="card">
  <div className="card-body">
    <div className="py-2 mb-2">
      <h5 className="text-primary">Add Task Details</h5>
    </div>

    <table className="table table-borderless" style={{ tableLayout: "fixed" }}>
      <tbody>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-card-heading"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Task Name <span className='text-danger'>*</span>
          </th>
          <td style={{ width: "58%" }}>
            <input
              className="form-control"
              type="text"
              name="Task_Name"
              value={taskData.Task_Name}
              onChange={handleChange}
            />
          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-journal"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Project Name <span className='text-danger'></span>
          </th>
          <td style={{ width: "58%" }}>

              <select
                className="form-control"
                name="Project_Name"
                value={taskData.Project_Name}
                onChange={handleChange}
              >
                <option disabled value="">Select Project</option>
                {myProjects.map((project) => (
                  <option key={project.ID} value={project.ID}>
                    {project.Project_Name}
                  </option>
                ))}
              </select>

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
            <textarea 
              className='form-control' 
              name="Task_Description"
              value={taskData.Task_Description}
              onChange={handleChange}
              
            ></textarea>
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
            <input 
              className='form-control' 
              name="Task_Status"
              value={taskData.Task_Status}
              onChange={handleChange}
              readOnly
              
            />
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
            <input 
            type='text'
              className='form-control' 
              name="Task_Date"
              value={taskData.Task_Date}
              onChange={handleChange}
              readOnly
            />
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
            <input 
              type='text'
              className='form-control' 
              name="Start_Time"
              value={taskData.Start_Time + " - " + taskData.End_Time}
              onChange={handleChange}
              readOnly
            />
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
           
              <select
                className="form-control"
                name="Task_Priority"
                value={taskData.Task_Priority}
                onChange={handleChange}
              >
                <option disabled value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

            
          </td>
        </tr>

        <tr className='d-none'>
          <th style={{ width: "7%" }}>
            <i className="bi bi-person"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Assignee
          </th>
          <td style={{ width: "58%" }}> 
             <input 
              type='text'
              className='form-control' 
              name="Assignee"
              value={taskData.Assignee}
              onChange={handleChange}
              
            />
          </td>
        </tr>


      <tr>
          <th style={{ width: "7%" }}>
            
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            <button className='btn btn-primary ' disabled={isSubmitting} onClick={handleSubmit}>{isSubmitting ? "Saving..." : "Submit"}</button>
          </th>
          <td style={{ width: "58%" }}> 
             
          </td>
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

export default AddTaskOffcanvas