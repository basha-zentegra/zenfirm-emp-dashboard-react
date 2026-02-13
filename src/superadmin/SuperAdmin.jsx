import {useState,useEffect} from 'react'
import { useUser } from '../context/UserContext'
import { formattedDate } from '../config';
import { getPriorityBorder } from '../utils/uiUtils';
import TodayPunch from './TodayPunch';

const SuperAdmin = () => {

    const {USERID} = useUser();
 
    const [todayTasks, setTodayTasks] = useState([])
    const [todayCompleted, setTodayCompleted] = useState([])
    const [todayInprog, setTodayInprog] = useState([])
    const [todayNotstarted, setTodayNotstarted] = useState([])

    const[overDueTasks, setOverDueTasks] = useState([])
 


    useEffect(() => {
        if (!USERID) return

        const config = {
            report_name: "Task_Report",
            criteria: `Task_Date == "${formattedDate}"`
        }

        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

            if(response.code === 3000){
                console.log("Super Admin Today's Task Data:", response.data)
                const taskRes = response.data;

              setTodayTasks(taskRes)
              setTodayCompleted(taskRes.filter(e => e.Task_Status === "Completed"))
              setTodayInprog(taskRes.filter(e => e.Task_Status === "In Progress"))
              setTodayNotstarted(taskRes.filter(e => e.Task_Status === "Not Started" || e.Task_Status === "" ))
            }
        
        })
        .catch((err) => console.error(err))

    }, [USERID])



    // FETCHING OVERDUE TASKS
    useEffect(() => {
        if (!USERID) return
    
        const config = {
          report_name: "Task_Report",
          criteria: `Task_Status!="Completed" && Task_Date < "${formattedDate}"`
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
          if(response.code === 3000){
            console.log("Over due Tasks Data:", response.data)
            const taskRes = response.data;
            setOverDueTasks(taskRes)
          }
            
          })
          .catch((err) => console.error(err))
    
    }, [USERID])



  return (
<div className='container pt-4'>
        SuperAdmin

<article>

<section className="app-stats pb-5">
  <div className="container">
   
    <div className="row g-4">
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-person-workspace fs-3 text-primary mb-3"></i>
          <h3 className="fs-4 fw-bold">{todayTasks.length}</h3>
          <p className="text-muted mb-0">Today's Task</p>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-check-circle-fill fs-3 text-success mb-3"></i>
          <h3 className="fs-4 fw-bold">{todayCompleted.length}</h3>
          <p className="text-muted mb-0">Completed</p>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-hourglass-split fs-3 text-warning mb-3"></i>
          <h3 className="fs-4 fw-bold">{todayInprog.length}</h3>
          <p className="text-muted mb-0">Inprogress</p>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-pause-circle fs-3 text-secondary mb-3"></i>
          <h3 className="fs-4 fw-bold">{todayNotstarted.length}</h3>
          <p className="text-muted mb-0">Not Started</p>
        </div>
      </div>
    </div>
  </div>
</section>

</article>
        


<div className='row g-4'>


        <div className="col-6">
            <div className="card" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>Today's Attendance</span>
              <div className="card-body scroll-karo">



                    <TodayPunch />

                

              </div>
            </div>
        </div>

        <div className="col-6">
            <div className="card" style={{height: "500px"}}>
              <span className=' ms-3 mt-2 cardsHeader'>Overdue Tasks - {overDueTasks.length}</span>
              <div className="card-body scroll-karo" >
                
                {overDueTasks.map((e,i) => {
                      return(
                        <div key={i} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}  - <span className='fw-medium text-dark'>{e?.Assignee?.Name || "NA"}</span> </small>
                                </div>
                                <div className='col-3 '>
                                  <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span>
                                </div>
                            </div>
                         
                        </div>
                      )
                  })}
              </div>
            </div>
        </div>



        <div className="col-6">
            <div className="card" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>Today's Tasks - {todayTasks.length}</span>
              <div className="card-body scroll-karo" >
                
                    {todayTasks.map(e => {
                      
                      return(
                        <div key={e.ID} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"} - <span className='fw-medium text-dark'>{e?.Assignee?.Name || "NA"}</span> </small>
                                </div>
                                <div className='col-3 '>
                                  <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    })}
                
              </div>
            </div>
        </div>


        <div className="col-6">
            <div className="card" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>BTR Events - {todayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Business Tax Filing").length}</span>
              <div className="card-body scroll-karo" >
                
                    {todayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Business Tax Filing").map(e => {
                      return(
                        <div className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}  - <span className='fw-medium text-dark'>{e?.Assignee?.Name || "NA"}</span> </small>
                                </div>
                                <div className='col-3 '>
                                 <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    })}
                
              </div>
            </div>
        </div>

        <div className="col-6">
            <div className="card" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>ITR Events - {todayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Individual Tax Filing").length}</span>
              <div className="card-body scroll-karo" >
                
                    {todayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Individual Tax Filing").map(e => {
                      return(
                        <div key={e.ID} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}  - <span className='fw-medium text-dark'>{e?.Assignee?.Name || "NA"}</span> </small>
                                </div>
                                <div className='col-3 '>
                                  <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    }) || "No ITR Events"}
                
              </div>
            </div>
        </div>


</div>

<br /><br />
























    </div>
  )
}

export default SuperAdmin