import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { formattedDate } from '../../config';
import { APP_NAME } from '../../config';
import ProjectSelect from '../projects/ProjectSelect';

const AddTaskOffcanvas = ({startEnd, setEvents, fetchTasks, resourceID = null}) => {
  const {USERID, projects, empName, orgEmp} = useUser();

  const myProjects = projects || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assigneName, setAssigneeName] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);

  const [phase, setPhase] = useState([])



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
    Assignee: resourceID || USERID,
    Repeat: false,
    Repeat_Type: "",
    Repeating_Times: "",
    Milestone_Name: ""
    // resources: resourceID ||
  });


  useEffect(()=> {

    if(!selectedProject) return;

    console.log("selectedProject",selectedProject)

    var config = {
      report_name: "All_Milestones",
      criteria: `Project_Name.ID ==${selectedProject.value}`
    };
    ZOHO.CREATOR.DATA.getRecords(config).then(function (response) {
      console.log("response in then block",response);
      if(response.code===3000){
        setPhase(response.data)
      }else{
        setPhase([])
      }
    }).catch(e => {
      setPhase([])
      console.log("catch blok is execting", e)

    })

  }, [selectedProject])

  // console.log(taskData)
    const onProjectChange = (selectedOption) => {
      console.log(selectedOption)
      setSelectedProject(selectedOption)
      setTaskData((prev) => ({
        ...prev,
        Project_Name:selectedOption.value
      }))
    }





  const projectName = selectedProject?.label;


   // 🔥 Sync when startEnd changes
  useEffect(() => {
    if (startEnd?.start && startEnd?.end) {
      const newAssignee = resourceID || USERID;
      setTaskData((prev) => ({
        ...prev,
        Start_Time: formatTimeToHHMM(startEnd.start),
        End_Time: formatTimeToHHMM(startEnd.end),
        Task_Date: formatDateToMMDDYYYY(startEnd.start),
        Assignee: newAssignee
      }));

      const employee = orgEmp.find(e => e.ID === newAssignee);
      setAssigneeName(employee?.Name || "NA");

      // setAssigneeName(orgEmp.find(e => e.ID === taskData.Assignee).Name)
      
    }
  }, [startEnd]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // setTaskData((prev) => ({
    //   ...prev,
    //   [name]: type === "checkbox" ? checked : value,
    // }));

    setTaskData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // handle Repeat logic here
      if (name === "Repeat") {
        updated.Repeating_Times = checked ? 1 : "";
        updated.Repeat_Type = checked ? "Daily" : "";
      }

      return updated;
    });

    

  };

  useEffect(() => {
    console.log(taskData);

    // if(taskData.Repeat == true){
    //   taskData.Repeating_Times = 1
    //   taskData.Repeat_Type = "Daily"
    // }else{
    //   taskData.Repeating_Times = ""
    //   taskData.Repeat_Type = ""
    // }

  }, [taskData]);

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
                resourceId: taskData?.Assignee ||  "unassigned",
                assigneeName: taskData?.Assignee || eve?.Assignee_Name || "",
              };
              setEvents(prev => [...prev, newEvent]);
              setTaskData((prev) => ({
                ...prev,
                Task_Name: "",
                Task_Description: "",
                Project_Name: "",
                Assignee: USERID,
                Repeat:false,
                Repeat_Type:"",
                Repeating_Times:"",
                Milestone_Name:""
              }));
              closeOffCanvas()
              setIsSubmitting(false)
              setSelectedProject(null)

              if(taskData.Repeat && fetchTasks){
                setTimeout(() => {
                  fetchTasks()
                }, 1000);
              }

          } else{
            console.log(response);
          }
      }).catch(e => console.log(e))
  }

  const handleSubmit = () => {

    if(!taskData.Task_Name || !taskData.Project_Name){
      alert("Task Name & Project is Mandatory")
      return
    }
    setIsSubmitting(true); // 🔒 disable button
    addEvent()
  }

  return (
    <>
<div className="offcanvas offcanvas-end" tabIndex="-1" id="addtaskoffcanvas" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>

  <div className="offcanvas-body">
   

<div className="card">
  <div className="card-body">
      <div className='text-end' style={{position:"absolute", top:"15px", right:"15px"}}>
          <button type="button"  className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>

      </div>
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
            Project Name <span className='text-danger'>*</span>
          </th>
          <td style={{ width: "58%" }}>

              <ProjectSelect onProjectChange={onProjectChange} selectedProject={selectedProject}/>

          </td>
        </tr>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-journal"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Phase Name 
          </th>
          <td style={{ width: "58%" }}>

              {/* <ProjectSelect onProjectChange={onProjectChange} selectedProject={selectedProject}/> */}
              <select
                className="form-control"
                name="Milestone_Name"
                value={taskData.Milestone_Name}
                onChange={handleChange}
              >
                <option disabled value="">Select Phase</option>
                {phase.map(e => (
                  <option value={e.ID}>{e.Phase_Name}</option>
                ))}

                {phase.length ===0 && (<option disabled value="">No Phases</option>)}
                {/* <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option> */}
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
              disabled
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
              disabled
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

        <tr className=''>
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
              value={assigneName}
              onChange={handleChange}
              disabled
              
            />
          </td>
        </tr>

        <tr className=''>
          <th style={{ width: "7%" }}>
            <i className="bi bi-person"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Assigned By
          </th>
          <td style={{ width: "58%" }}> 
             <input 
              type='text'
              className='form-control' 
              name="Assignee"
              value={empName}
              // onChange={}
              disabled
              
            />
          </td>
        </tr>

        <tr className=''>
          <th style={{ width: "7%" }}>
            <i class="bi bi-repeat"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Repeat
          </th>
          <td style={{ width: "58%" }}> 

              
             <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                name="Repeat"
                checked={taskData.Repeat}
                onChange={handleChange}
              />
            </div>


            {taskData.Repeat && (
              <div className='d-flex gap-3 mt-2'>



                <div className='w-100'>
                    <span class="fs-12p text-muted">
                      Repeat Type <i class="bi bi-chevron-down"></i>
                    </span>
                      <select
                        className="form-control"
                        name="Repeat_Type"
                        value={taskData.Repeat_Type}
                        onChange={handleChange}
                      >
                        <option disabled value="">Repeat Type</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                    </select>

                    
                </div>

                <div className='w-100'>

                  <span class="fs-12p text-muted">
                      Repeat Count (Max 15)
                  </span>

                  <input 
                    type="number" 
                    className='form-control' 
                    name="Repeating_Times" 
                    value={taskData.Repeating_Times} 
                    onChange={handleChange}
                    max={15}
                    min={1}
                    onInput={(e) => {
                      if (e.target.value > 15) e.target.value = 15;
                      if (e.target.value < 1) e.target.value = 1;
                    }}
                  />

                </div>


              


            </div>
            )}

            

          </td>
        </tr>

        {/* <tr className=''>
          <th style={{ width: "7%" }}>
            <i class="bi bi-suitcase-lg"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Add To Meeting
          </th>
          <td style={{ width: "58%" }}> 
             <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                name="Repeat"
                // checked={taskData.Repeat}
                // onChange={handleChange}
              />
            </div>
          </td>
        </tr> */}


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



// EDm7A-EC8l6PbPVjhIks7Q