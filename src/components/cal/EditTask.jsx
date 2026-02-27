import {useState, useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { inputToMMDDYYYY, zohoToInput } from '../../utils/dateUtils';

const EditTask = ({selectedEvent,setEdit,fetchTasks}) => {

    const {USERID,projects} = useUser();

    const myProjects = projects || [];


    const [taskData, setTaskData] = useState({
        Task_Name: selectedEvent?.Task_Name || "",
        Task_Description: selectedEvent?.Task_Description || "",
        Task_Priority: selectedEvent?.Task_Priority || "",
        Project_Name: selectedEvent?.Project_Name?.ID || "",
        Task_Date: zohoToInput(selectedEvent?.Task_Date) || "",
        Assignee: selectedEvent?.Assignee?.ID || "",
        Budgeted_Time: selectedEvent?.Budgeted_Time || "",
        Due_Date: zohoToInput(selectedEvent?.Due_Date) || ""
    });

    useEffect(() => {
        if (selectedEvent) {
            setTaskData({
                Task_Name: selectedEvent?.Task_Name || "",
                Task_Description: selectedEvent?.Task_Description || "",
                Task_Priority: selectedEvent?.Task_Priority || "",
                Project_Name: selectedEvent?.Project_Name?.ID || "",
                Task_Date: zohoToInput(selectedEvent?.Task_Date) || "",
                Assignee: selectedEvent?.Assignee?.ID || "",
                Budgeted_Time: selectedEvent?.Budgeted_Time || "",
                Due_Date: zohoToInput(selectedEvent?.Due_Date) || ""
            });
        }
    }, [selectedEvent]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setTaskData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = () => {
  
        console.log("TaskData", taskData);

        if(!taskData.Task_Name){
            alert("Task Name is Mandatory")
            return
        }
    //   setIsSubmitting(true); // 🔒 disable button
        addEvent()
    }

    const closeOffCanvas = () => {

        const taskdetailsclsbtn = document.getElementById("taskdetailsclsbtn");
        if (taskdetailsclsbtn) {
            taskdetailsclsbtn.click();
        }
    
    }

    function addEvent() {

        const formattedDueDate = inputToMMDDYYYY(taskData.Due_Date);
        const formattedTaskDate = inputToMMDDYYYY(taskData.Task_Date);

        var config = {
            report_name: "Task_Report",
            id: selectedEvent.ID,
            payload: {
                data: {
                    ...taskData,
                    Due_Date: formattedDueDate,
                    Task_Date: formattedTaskDate
                }
            }
        };
        console.log(taskData)
        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response.message);
                // console.log("Afer API",taskData)
                closeOffCanvas()
                setEdit(false)
                fetchTasks()
                // setIsSubmitting(false)
    
            } else{
                console.log(response);
            }
        }).catch(e => console.log(e))
    }

  return (
    <div>
         <div className="py-2 mb-2">
          <h5 className="text-primary">Edit Task</h5>
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
            Project
          </th>
          <td style={{ width: "58%" }}>

            <select
                className="form-control"
                name="Project_Name"
                value={taskData.Project_Name}
                onChange={handleChange}
              >
                <option  disabled value="">Select Project</option>
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
            <i className="bi bi-calendar-check"></i>
          </th>
          <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
            Task Date
          </th>
          <td id="startDate" style={{ width: "58%" }}>
            <input 
                type='date'
                className='form-control' 
                name="Task_Date"
                value={taskData.Task_Date}
                onChange={handleChange}
                
              />
          </td>
        </tr>

        <tr>
            <th style={{ width: "7%" }}>
              <i className="bi bi-calendar-check"></i>
            </th>
            <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
              Due Date 
            </th>
            <td style={{ width: "58%" }}>
              <input 
                type='date'
                className='form-control' 
                name="Due_Date"
                value={taskData.Due_Date}
                onChange={handleChange}
                
              />
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
            
            style={{ width: "58%" }}
          >
            <select className="form-control" name="Budgeted_Time" onChange={handleChange} value={taskData.Budgeted_Time} >
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

        <tr>

            <th style={{ width: "7%" }}>
              
            </th>
            <th className="fw-semibold" style={{ color: "#3e4043", width: "35%" }}>
              <button className='btn btn-primary '  onClick={handleSubmit}>Update</button>
            </th>
            <td style={{ width: "58%" }}> 
               
            </td>

        </tr>

      </tbody>
    </table>




    </div>
  )
}

export default EditTask