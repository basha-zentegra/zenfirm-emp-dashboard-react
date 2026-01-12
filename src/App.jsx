import { useState,useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {


  const APP_NAME = "zenfirm-old"

  const [userEmail, setUserEmail] = useState("")
  const [USERID, setUserID] = useState("")
  const[myTasks, setMyTasks] = useState([])
  const [myTodayTasks, setMyTodayTasks] = useState([])
  const[overDueTasks, setOverDueTasks] = useState([])


  const today = new Date();
  const formattedDate = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}-${today.getFullYear()}`;


  
  useEffect(() => {
    ZOHO.CREATOR.UTIL.getInitParams().then((response) => {
        console.log("Init Params:", response)
        setUserEmail(response?.loginUser)
      })
      .catch((err) => console.error(err))
  }, []) 

  
  useEffect(() => {
    if (!userEmail) return

    const config = {
      app_name: APP_NAME,
      report_name: "All_Employee",
      criteria: `Email=="${userEmail}"`
    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        console.log("Employee Data:", response)
        setUserID(response.data[0].ID)
      })
      .catch((err) => console.error(err))

  }, [userEmail])


  useEffect(() => {
    if (!USERID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",

    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        console.log("Task Data:", response)
        const taskRes = response.data;

        setMyTasks(taskRes.filter(e => e.Assignee.ID === USERID))
        setMyTodayTasks(taskRes.filter(e => e.Assignee.ID === USERID && e.Task_Date === formattedDate))

        // console.log(myTasks)
      })
      .catch((err) => console.error(err))

  }, [USERID])


    useEffect(() => {
    if (!USERID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",
      criteria: `Assignee.ID==${USERID} && Task_Status!="Completed" && Task_Date < "${formattedDate}"`

    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        console.log("Over due Tasks Data:", response)
        const taskRes = response.data;

        // setMyTasks(taskRes.filter(e => e.Assignee.ID === USERID))
        // setMyTodayTasks(taskRes.filter(e => e.Assignee.ID === USERID && e.Task_Date === formattedDate))

        // console.log(myTasks)

        setOverDueTasks(taskRes)
      })
      .catch((err) => console.error(err))

  }, [USERID])



  const getPriorityBorder = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "border-danger bg-danger-subtle";
    case "medium":
      return "border-warning bg-warning-subtle";
    case "low":
      return "border-success bg-success-subtle";
    default:
      return "border-dark bg-secondary-subtle";
  }
};


  return (
    <>
      {/* <h1>{userEmail}</h1>
      <h2>{USERID}</h2>

      {console.log(myTasks)}
      {console.log(myTodayTasks)} */}

<main className='d-flex' style={{overflow: "hidden"}}>

        <aside style={{ position: "fixed", width: "15%" }}>

          <Sidebar userEmail={userEmail}/>

        </aside>

<section className='container pt-4' style={{ marginLeft:"280px", overflowY: "auto" }}>




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
          <h3 className="fs-4 fw-bold">5</h3>
          <p className="text-muted mb-0">Completed</p>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-hourglass-split fs-3 text-warning mb-3"></i>
          <h3 className="fs-4 fw-bold">4</h3>
          <p className="text-muted mb-0">Inprogress</p>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="stat-card text-center bg-white p-4 shadow-sm rounded">
          <i className="bi bi-pause-circle fs-3 text-info mb-3"></i>
          <h3 className="fs-4 fw-bold">1</h3>
          <p className="text-muted mb-0">Not Started</p>
        </div>
      </div>
    </div>
  </div>
</section>




</article>




<div className='row g-4'>


        <div className="col-6">
            <div class="card" style={{height: "500px"}}>
              <span className='h3 ms-3 mt-2'>My Overdue Tasksk</span>
              <div class="card-body" style={{height: "800px",overflowY : "auto"}}>
                {/* <table className='table'>
                    {myTasks.map(e => {
                      return(
                        <tr>
                          <td>{e.Task_Name}</td>
                        </tr>
                      ) 
                    })}
                </table> */}
                {overDueTasks.map((e,i) => {
                  console.log(e)
                      return(
                        <div key={i} className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>

                          
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 '>
                                  <div className='small border border-dark rounded-5 px-2 py-1 mt-2 text-center'>{e.Task_Status || "Unscheuled"}</div>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    })}
              </div>
            </div>
        </div>

        <div className="col-6">
            <div class="card" style={{height: "500px"}}>
              <span className='h3 ms-3 mt-2'>Today's Tasks</span>
              <div class="card-body" style={{height: "800px",overflowY : "auto"}}>
                
                    {myTodayTasks.map(e => {
                      return(
                        <div className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 '>
                                  <div className='small border border-dark rounded-5 px-2 py-1 mt-2 text-center'>{e.Task_Status || "Unscheuled"}</div>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    })}
                
              </div>
            </div>
        </div>


        <div className="col-6">
            <div class="card">
              <span className='h3 ms-3 mt-2'>BTR Events</span>
              <div class="card-body">
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Business Tax Filing").map(e => {
                      return(
                        <div className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 '>
                                  <div className='small border border-dark rounded-5 px-2 py-1 mt-2 text-center'>{e.Task_Status || "Unscheuled"}</div>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    })}
                
              </div>
            </div>
        </div>

        <div className="col-6">
            <div class="card">
              <span className='h3 ms-3 mt-2'>ITR Events</span>
              <div class="card-body">
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"].Project_Group === "Individual Tax Filing").map(e => {
                      return(
                        <div className={`card mb-3  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-4 py-3">
                                <div className='col-9'>
                                  <span className='d-block'>{e.Task_Name}</span>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 '>
                                  <div className='small border border-dark rounded-5 px-2 py-1 mt-2 text-center'>{e.Task_Status || "Unscheuled"}</div>
                                </div>
                            </div>
                         
                        </div>
                      ) 
                    }) || "No ITR Events"}
                
              </div>
            </div>
        </div>


</div>




        </section>






</main>







    </>
  )
}

export default App
