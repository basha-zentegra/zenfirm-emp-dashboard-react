import {useEffect, useState, useMemo} from 'react'
import { APP_NAME } from '../../config';
import { useUser } from '../../context/UserContext';
import { parseEventDate, formatDateToMMDDYYYY, formatTimeToHHMM } from '../../utils/dateUtils';






const closeOffcanvas = () => {
    const element = document.getElementById("unscheduledOffcanvass");
    
    if (!element) {
        console.error("Offcanvas element not found");
        return;
    }
    
    // Get existing instance or create new one
    const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(element) 
        || new window.bootstrap.Offcanvas(element);
    
    bsOffcanvas.hide();
}







const UnScheduledTasks = ({setEvents}) => {




      const {USERID} = useUser();

      const [unsTasks, setUNSTasks] = useState([]);


// Group tasks by project name
      const groupedTasks = useMemo(() => {
          const grouped = {};
          
          unsTasks.forEach(task => {
              const projectName = task?.Project_Name?.Project_Name || "No Project";
              
              if (!grouped[projectName]) {
                  grouped[projectName] = [];
              }
              
              grouped[projectName].push(task);
          });
          
          const sortedGroups = Object.keys(grouped).sort().reduce((acc, key) => {
              acc[key] = grouped[key];
              return acc;
          }, {});
          
          return sortedGroups;
      }, [unsTasks]);
  
      useEffect(() => {
          if (!USERID) return
      
          const config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            criteria: `Assignee.ID==${USERID} && Task_Date==null || Start_Time ==null `
          }
      
          ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
      
              if(response.code === 3000){
                console.log("UnScheduled Tasks:", response.data)
                const taskRes = response.data;
  
                  setUNSTasks(taskRes)
                
              }else{
                
              }

              console.log("UnScheduled RESPONSE:", response)
              
            })
            .catch((err) => console.error(err))
      
      }, [USERID])

      

      const removeEvent = (currentID) => {
          setUNSTasks(prevEvents =>
              prevEvents.filter(event => event.ID !== currentID)
          );
      };


      const handleAddButton = (element) => {

        let oneHourLater = new Date(Date.now() + 60 * 60 * 1000);

        if(element?.Budgeted_Time){

          const [hour,min] = element?.Budgeted_Time.split(" ");

          const hours = Number(hour.slice(0, -1));
          const minutes = Number(min.slice(0, -1));

          const delayMs =(hours * 60 * 60 * 1000) + (minutes * 60 * 1000);   

          const delayedTime = new Date(Date.now() + delayMs);
          oneHourLater = delayedTime;
          console.log(delayedTime);

        }
          
        const newEvent = {
            id: element.ID,
            title: element.Task_Name,
            start: new Date(),
            end: oneHourLater,
            priority: element.Task_Priority.toLowerCase(),
            projectName: element?.Project_Name?.Project_Name,
            taskStatus: element?.Task_Status
        }

        console.log(newEvent)
        console.log(element)

        setEvents(prev => [...prev, newEvent]);
        updateEvent(newEvent)
        

      }


    function updateEvent(event){
      var config = {
          app_name: APP_NAME,
          report_name: "Task_Report",
          id: event.id,
          payload: {
              data: {
                  Start_Time: formatTimeToHHMM(event.start),
                  End_Time: formatTimeToHHMM(event.end),
                  Task_Date: formatDateToMMDDYYYY(event.start) 
          } }
      };
      ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
          if (response.code == 3000) {
              console.log(response);
              removeEvent(event.id)
              closeOffcanvas()
          }else{
              console.log(response)
              console.log(config)
          }
      }).catch(e => console.log(e))
  }



  return (
    <>


    <div className="offcanvas offcanvas-end" tabIndex="-1" id="unscheduledOffcanvass" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
        <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="taskOffcanvasLable">My Unscheduled Tasks</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">

          <button className='d-none' onClick={closeOffcanvas}>
            cls
          </button>

          <section className='row g-3'>

            {unsTasks.length === 0 && (
              <div>
                <p className="lead text-center">There are no UnScheduled tasks for you..</p>
              </div>
            )}

            {/* {unsTasks.length > 0 && unsTasks.map(element => (
              <div key={element.ID} className='col-3 border rounded-3 m- p-2 pt-0'>
                <div className="">
                  <button onClick={() => handleAddButton(element)} className='btn btn-sm btn-primary text-center w-100'>Add</button>
                  <p className='no-wrap'>{element?.Task_Name}</p>
                  <small className='text-uppercase text-muted'>{element?.Project_Name?.Project_Name || "No Project"}</small> <br />
                  
                </div>
              </div>
            ))} */}

                        {/* Grouped by Project Name */}
            {Object.entries(groupedTasks).map(([projectName, tasks]) => (
              <div key={projectName} className="mb-4">
                {/* Project Header */}
                <div className="d-flex align-items-center mb-2">
                  <h6 className="mb-0 text-uppercase fw-bold text-dark">
                    {/* <i className="bi bi-folder me-2"></i> */}
                    <i class="bi bi-journal-bookmark-fill me-2"></i>
                    {projectName}
                  </h6>
                  <span className="badge bg-secondary ms-2">{tasks.length}</span>
                </div>
                <hr className="mt-1 mb-2" />

                {/* Tasks under this project */}
                <div className="row g-2">
                  {tasks.map(element => (
                    <div key={element.ID} className='col-4'>
                      <div className="card border rounded-3 p-2 pt-0 px-0 h-100">
                        <div className={`card-header py-1 fw-semibold text-center cursor-pointer opacity-75 ${element?.Task_Priority.toLowerCase().replace(" ", "-") || "not-started"}`} onClick={() => handleAddButton(element)} >

                        Add
                        </div>
                        
                        <div className="card-body p-2">
                          <p className='no-wrap mb-1 fw-medium'>{element?.Task_Name}</p>
                          {/* <small className='text-uppercase text-muted'>
                            {element?.Project_Name?.Project_Name || "No Project"}
                            </small> */}
                        </div>


                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </section>

            

        </div>

    </div>




    </>
  )
}

export default UnScheduledTasks