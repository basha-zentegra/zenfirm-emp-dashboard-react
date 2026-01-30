import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { formattedDate } from '../../config';
import { APP_NAME } from '../../config';

const KanbanAddTask = ({list,selectedProject,setKanbanTasks}) => {


    if(!selectedProject || !list){
        return null;
    }

    const {USERID, projects, orgEmp} = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);



  
    const [taskData, setTaskData] = useState({
      Task_Name: "",
      Task_Description: "",
      Task_Status: "Not Started",
      Task_Priority: "Low",
      Project_Name: selectedProject?.ID,
      Task_Date: formattedDate,
      Assignee: USERID,
      Kanban_Status: list,
      Budgered_Time: "1h 0m"
    });

    useEffect(()=>{
      setTaskData((prev) => ({
        ...prev,
        Kanban_Status: list,
        
      }));
      
    },[list])

  
    console.log(taskData)
  

    const handleChange = (e) => {
      const { name, value } = e.target;
      setTaskData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const closeOffCanvas = () => {
      const element = document.getElementById("addtaskoffcanvaskanban");
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(element);
      bsOffcanvas?.hide();
  
    }

    const closeButton = () =>{
      setTaskData((prev) => ({
                  ...prev,
                  Task_Name: "",
                  Task_Description: "",
                  Kanban_Status: "",

                }));
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
                console.log(response.message);
                console.log(taskData)
                const newEvent = {
                  ID: response.data.ID,
                  Task_Name:taskData.Task_Name,
                  Task_Description:taskData.Task_Description,
                  Kanban_Status:taskData.Kanban_Status
                };
                setKanbanTasks(prev => [...prev, newEvent]);
                setTaskData((prev) => ({
                  ...prev,
                  Task_Name: "",
                  Task_Description: "",
                  Assignee: USERID
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
  <div className="offcanvas offcanvas-end" tabIndex="-1" id="addtaskoffcanvaskanban" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
    <div className="offcanvas-header">
      <h5 className="offcanvas-title" id="taskOffcanvasLable"></h5>
      <button type="button" onClick={closeButton} className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
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
  
                <input
                  className="form-control"
                  name="Project_Name"
                  value={selectedProject?.Project_Name}
                    readOnly
                />

  
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
              <i className="bi bi-calendar-check"></i>
            </th>
            <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
              Kanban Status
            </th>
            <td  style={{ width: "58%" }}>
              <input 
                type='text'
                className='form-control' 
                name="Kanban_Status"
                value={taskData.Kanban_Status}
                // onChange={handleChange}
                readOnly
              />
            </td>
          </tr>
  
          <tr>
            <th style={{ width: "7%" }}>
              <i className="bi bi-clock"></i>
            </th>
            <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
              Budgeted Time
            </th>
            <td id="endDate" style={{ width: "58%" }}>
                <select class="form-control" name="Budgered_Time" onChange={handleChange} value={taskData.Budgered_Time} >
                    <option disabled value="">Select duration</option>
                    <option value="0h 30m">0h 30m</option>
                    <option value="1h 0m">1h 0m</option>
                    <option value="2h 0m">2h 0m</option>
                    <option value="3h 0m">3h 0m</option>
                    <option value="4h 0m">4h 0m</option>
                </select>
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
  
          <tr className=''>
            <th style={{ width: "7%" }}>
              <i className="bi bi-person"></i>
            </th>
            <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
              Assignee
            </th>
            <td style={{ width: "58%" }}> 
               {/* <input 
                type='text'
                className='form-control' 
                name="Assignee"
                value={taskData.Assignee}
                onChange={handleChange}
                
              /> */}
              <select
                  className="form-control"
                  name="Assignee"
                  value={taskData.Assignee}
                  onChange={handleChange}
                >
                  {orgEmp.map(employee => (
                    <option value={employee.ID}>{employee?.Name}</option>
                  ))}
              </select>
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

export default KanbanAddTask