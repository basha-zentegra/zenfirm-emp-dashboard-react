import {useState,useEffect, useMemo} from 'react'
import { useUser } from '../../context/UserContext';
import { formattedDate } from '../../config';
import { APP_NAME } from '../../config';
import ProjectSelect from '../projects/ProjectSelect';
import Select from 'react-select';
import { formatDate } from 'date-fns';
import { taskDuration, taskDurationHHMM } from '../../utils/taskUtils';
import TaskSelect from '../projects/TaskSelect';




const AddTaskOffcanvas = ({startEnd, setEvents, fetchTasks, resourceID = null}) => {
  const {USERID, projects, empName, orgEmp, isManager} = useUser();

  const myProjects = projects || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assigneName, setAssigneeName] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [phase, setPhase] = useState([])



  // console.log(startEnd.start, startEnd.end, USERID )

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

  function createDateFromDateAndTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    const [month, day, year] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes);
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
    Milestone_Name: "",
    Other_Assignees: [],
    Budgeted_Time: taskDuration(startEnd.start, startEnd.end),
    // resources: resourceID ||
  });

  const [existingTaskData,setExistingTaskData] = useState({
    Task: "",
    Start_Time: formatTimeToHHMM(startEnd.start),
    End_Time:  formatTimeToHHMM(startEnd.end),
    Task_Date: formatDateToMMDDYYYY(startEnd.start),
  })


    const [allEmp, setAllEmp] = useState([]);

    const memberOptions = useMemo(() => {
      return allEmp?.map(e => ({value: e?.ID, label: e?.Name})) || [];
    }, [allEmp]);

    useEffect(() => {

      if(!isManager) return;

      const fetchEmployees = async () => {
        try {
          const response = await ZOHO.CREATOR.DATA.getRecords({
            report_name: "My_Team_Employees",
          });

          if (response.code === 3000) {
            setAllEmp(response.data.filter(emp => emp.Email));
          } else {
            console.log(response);
          }
        } catch (err) {
          console.error(err);
        } 
      };

      fetchEmployees();    
    }, [isManager])


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
      
      setSelectedProject(selectedOption)
      setTaskData((prev) => ({
        ...prev,
        Project_Name:selectedOption.value
      }))
    }

    

    const onTaskChange = (selectedOption) => {

      setSelectedTask(selectedOption)
      setExistingTaskData((prev) => ({
        ...prev,
        Task:selectedOption.value
      }))

    }


    useEffect(() => {
      console.log(existingTaskData)
    },[existingTaskData])





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
        Budgeted_Time: taskDuration(startEnd.start, startEnd.end),
        Assignee: newAssignee
      }));

      setExistingTaskData((prev) => ({
        ...prev,
        Start_Time: formatTimeToHHMM(startEnd.start),
        End_Time: formatTimeToHHMM(startEnd.end),
        Task_Date: formatDateToMMDDYYYY(startEnd.start),
      }))

      const employee = orgEmp.find(e => e.ID === newAssignee);
      setAssigneeName(employee?.Name || "NA");

      // setAssigneeName(orgEmp.find(e => e.ID === taskData.Assignee).Name)

      console.log("startEnd", startEnd, taskDuration(startEnd.start, startEnd.end))
      
    }
  }, [startEnd]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    console.log(name, value )

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

    if(name === "Start_Time"){
      setTaskData((p) => ({...p, Budgeted_Time: taskDurationHHMM(value, taskData.End_Time)}))
    }

    if(name === "End_Time"){
      setTaskData((p) => ({...p, Budgeted_Time: taskDurationHHMM( taskData.Start_Time, value)}))
    }

    

  };

  useEffect(() => {



  },[formatDate.Start_Time, formatDate.End_Time])

  // useEffect(() => {
  //   console.log(taskData);

  //   // if(taskData.Repeat == true){
  //   //   taskData.Repeating_Times = 1
  //   //   taskData.Repeat_Type = "Daily"
  //   // }else{
  //   //   taskData.Repeating_Times = ""
  //   //   taskData.Repeat_Type = ""
  //   // }

  // }, [taskData]);

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
          console.log("Add Event",response);
          if (response.code == 3000) {
              console.log(taskData)
              const newEvent = {
                id: response.data.ID,
                title:taskData.Task_Name,
                start: createDateFromDateAndTime(taskData.Task_Date, taskData.Start_Time),
                end: createDateFromDateAndTime(taskData.Task_Date, taskData.End_Time),
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
                Milestone_Name:"",
                Other_Assignees: []
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

  const handleExistingSubmit = () => {
    if(!existingTaskData.Task){
      alert("Task Name is Mandatory")
      return
    }
    setIsSubmitting(true);
    var config = {
          form_name: "Multiple_Tasks",
          payload: {
              data: existingTaskData
          }
      };
      ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
          console.log("Adding Multiple Event",response);
          if (response.code == 3000) {
              // console.log(taskData)
              const newEvent = {
                id: response.data.ID,
                title: selectedTask?.label || "N/A",
                start: createDateFromDateAndTime(existingTaskData.Task_Date, existingTaskData.Start_Time),
                end: createDateFromDateAndTime(existingTaskData.Task_Date, existingTaskData.End_Time),
                priority: "multiple",
                projectName: selectedProject.label || "NA",
                multipleTask: true,
                taskId: existingTaskData.Task
                // resourceId: taskData?.Assignee ||  "unassigned",
                // assigneeName: taskData?.Assignee || eve?.Assignee_Name || "",
              };
              setEvents(prev => [...prev, newEvent]);
              setExistingTaskData({Task: "",
                Start_Time: formatTimeToHHMM(startEnd.start),
                End_Time:  formatTimeToHHMM(startEnd.end),
                Task_Date: formatDateToMMDDYYYY(startEnd.start)
              })
              closeOffCanvas()
              setIsSubmitting(false)
              setSelectedTask(null)
              setExistingTask(false)
              setSelectedProject(null)
              

          } else{
            console.log(response);
          }
      }).catch(e => console.log(e))

  }

  const [existingTask, setExistingTask] = useState(false);

  return (
    <>
  <div className="offcanvas offcanvas-end" tabIndex="-1" id="addtaskoffcanvas" aria-labelledby="taskOffcanvasLable" 
  style={{width: "800px",
    backgroundColor:"rgba(255, 255, 255, 0.06)",
  border:"rgba(255, 255, 255, 0.14)"
  }}>

  <div className="offcanvas-body">
   

<div className="card shadow-shopify border-0 rounded-4">
  <div className="card-body">
      <div className='text-end' style={{position:"absolute", top:"15px", right:"15px"}}>
          <button type="button"  className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>

      </div>
    <div className="py-2 mb-2 d-flex">
      <h5 className="text-zen-gradient me-5">Add Task Details</h5>
      

      <div className="form-check form-switch">
        <input
          className="form-check-input custom-switch"
          type="checkbox"
          role="switch"
          checked={existingTask}
          onChange={(e) => setExistingTask(e.target.checked)}
        />

        <label className="form-check-label text-zen-gradient">
          Existing Task
        </label>
      </div>
      
    </div>

  {!existingTask && (
    <>

      <table className="table table-borderless" style={{ tableLayout: "fixed" }}>
      <tbody>

        <tr>
          <th style={{ width: "7%" }}>
            <i className="bi bi-clipboard-check"></i>
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
            <i className="bi bi-card-heading"></i>
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
            <i className="bi bi-signpost"></i>
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
              row="1"
              
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
          <td className='' style={{ width: "58%" }}>


<div className=" d-flex justify-content-between ">
            <input 
              type="time"
              className='form-control me-3' 
              name="Start_Time"
              value={taskData.Start_Time}
              onChange={handleChange}
            />

            <input 
              type="time"
              className='form-control me-3' 
              name="End_Time"
              value={taskData.End_Time}
              onChange={handleChange}
            />


            <div style={{width:"200px"}} className='d-flex align-items-center' >
              <p className='badge bg-primary p-1 small' >{taskData.Budgeted_Time}</p>
            </div>
</div>
              
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

        {isManager && (

          <tr>

              <th style={{ width: "7%" }}>
                <i class="bi bi-people"></i>
              </th>
              <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
                Other Assignees
              </th>
              <td>
                <Select 
                  
                  options={memberOptions} 
                  isMulti 
                  value={memberOptions.filter(option =>
                    (taskData.Other_Assignees || []).includes(option.value)
                  )}
                  onChange={(selected) => setTaskData({...taskData,Other_Assignees: selected ? selected.map(opt => opt.value) : []})}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select members..."
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? "#754ffe95" : baseStyles.borderColor,
                      boxShadow: state.isFocused ? "0 0 0 0.25rem #e3dcff" : "none",
                      "&:hover": {
                        borderColor: "none",
                      },
                    }),
                  }}
                />
              </td>
          </tr>

        )}

        {/* <tr className=''>
          <th style={{ width: "7%" }}>
            <i class="bi bi-person-check"></i>
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
        </tr> */}

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

        


      </tbody>
    </table>

    <button className='action-btn btn-purple ms-3 my-2' disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Saving..." : "Submit"}
    </button>


    </>
  )}


  {existingTask && (
    <div className=''>
      <table className='table table-borderless'>
        <tbody>
          <tr>
            <th style={{ width: "7%" }}>
              <i className="bi bi-card-heading"></i>
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
                <i class="bi bi-clipboard-check"></i>
              </th>
              <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
                Task Name<span className='text-danger'>*</span>
              </th>
              <td>
                <TaskSelect onTaskChange={onTaskChange} selectedTask={selectedTask} selectedProject={selectedProject} />
              </td>
          </tr>
        </tbody> 
      </table>

      <button className='action-btn btn-purple ms-3 my-2' disabled={isSubmitting} onClick={handleExistingSubmit}>
          {isSubmitting ? "Saving..." : "Submit"}
      </button>
    </div>
  )}
    
    
  </div>
</div>



<br /><br /><br />

  </div>
</div>
    
    
    </>
  )
}

export default AddTaskOffcanvas



// EDm7A-EC8l6PbPVjhIks7Q