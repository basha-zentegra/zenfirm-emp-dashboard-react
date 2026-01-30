import { useState,useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { APP_NAME } from '../config'
import { formattedDate } from '../config'

const Home = () => {

  const { USERID } = useUser();

  const [myTodayTasks, setMyTodayTasks] = useState([])
  const[overDueTasks, setOverDueTasks] = useState([])
  const[todayCompleted, setTodayCompleted] = useState([])
  const[todayInprog, setTodayInprog] = useState([])
  const[todayNotStarted, setTodayNotstarted] = useState([])


  useEffect(() => {
    if (!USERID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",
      criteria: `Assignee.ID==${USERID} && Task_Date == "${formattedDate}"`
    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

        if(response.code === 3000){
          console.log("Today's Task Data:", response.data)
          const taskRes = response.data;

          setMyTodayTasks(taskRes.filter(e => e.Assignee.ID === USERID))
          setTodayCompleted(taskRes.filter(e => e.Assignee.ID === USERID && e.Task_Status === "Completed"))
          setTodayInprog(taskRes.filter(e => e.Assignee.ID === USERID && e.Task_Status === "In Progress"))
          setTodayNotstarted(taskRes.filter(e => e.Assignee.ID === USERID && e.Task_Status === "Not Started"))
        }
        
      })
      .catch((err) => console.error(err))

  }, [USERID])


    // FETCHING OVERDUE TASKS
    useEffect(() => {
    if (!USERID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",
      criteria: `Assignee.ID==${USERID} && Task_Status!="Completed" && Task_Date < "${formattedDate}"`

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

const getPriorityBorder = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "border-dange bg-red";
    case "medium":
      return "border-warnin bg-yellow";
    case "low":
      return "border-succes bg-green";
    default:
      return "border-dar bg-secondary-subtl";
  }
};



  return (
    <div className='container pt-4'>



<article>

<section className="app-stats pb-5">
  <div className="container">
   
    <div className="row g-4">
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-person-workspace fs-3 text-primary mb-3"></i>
          <h3 className="fs-4 fw-bold">{myTodayTasks.length}</h3>
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
          <i className="bi bi-pause-circle fs-3 text-info mb-3"></i>
          <h3 className="fs-4 fw-bold">{todayNotStarted.length}</h3>
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
              <span className='h4 ms-3 mt-2'>My Overdue Tasks - {overDueTasks.length}</span>
              <div className="card-body" style={{height: "800px",overflowY : "auto"}}>
                
                {overDueTasks.map((e,i) => {
                  
                      return(
                        <div key={i} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>

                          
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
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
              <span className='h4 ms-3 mt-2'>Today's Tasks - {myTodayTasks.length}</span>
              <div className="card-body" style={{height: "800px",overflowY : "auto"}}>
                
                    {myTodayTasks.map(e => {
                      
                      return(
                        <div key={e.ID} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
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
            <div className="card">
              <span className='h4 ms-3 mt-2'>BTR Events - {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Business Tax Filing").length}</span>
              <div className="card-body" style={{height: "500px",overflowY : "auto"}}>
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Business Tax Filing").map(e => {
                      return(
                        <div className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
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
            <div className="card">
              <span className='h4 ms-3 mt-2'>ITR Events - {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Individual Tax Filing").length}</span>
              <div className="card-body" style={{height: "500px",overflowY : "auto"}}>
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Individual Tax Filing").map(e => {
                      return(
                        <div key={e.ID} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
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

export default Home