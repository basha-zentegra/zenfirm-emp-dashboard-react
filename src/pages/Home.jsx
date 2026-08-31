import { useState,useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { APP_NAME } from '../config'
import { formattedDate } from '../config'
import HomePunch from '../components/punch/HomePunch'
import OffcanvasTaskDetails from '../components/cal/OffcanvasTaskDetails'
// import { getPriorityBorder } from '../utils/uiUtils'
import WorkdayTracker from '../components/punch/Workdaytracker'
import ToastContainer from '../components/ui/ToastContainer'
import Announcements from '../components/home/Announcements'
import Timesheet from '../components/home/Timesheet'
import TodayTimesheet from '../components/home/TodayTimesheet'
import UpcomingHolidays from '../components/home/UpcomingHolidays'

export const getPriorityBorder = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return " bg-red text-danger";
    case "medium":
      return " bg-yellow text-warning";
    case "low":
      return " bg-green text-success";
    default:
      return "border-dar bg-secondary-subtl";
  }
};

const Home = () => {

  const { USERID, ORG } = useUser();

  const [UID, setUID] = useState(USERID);

  const [myTodayTasks, setMyTodayTasks] = useState([])
  const[overDueTasks, setOverDueTasks] = useState([])
  const[todayCompleted, setTodayCompleted] = useState([])
  const[todayInprog, setTodayInprog] = useState([])
  const[todayNotStarted, setTodayNotstarted] = useState([])

  const [selectedTask, setSelectedTask] = useState(null)

  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [now, setNow] = useState(Date.now());

  const [triggerApi, setTriggerApi] = useState(false);

  useEffect(() => {
    if (!UID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",
      criteria: `Assignee.ID==${UID} && Task_Date == "${formattedDate}"`
    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

        if(response.code === 3000){
          console.log("Today's Task Data:", response.data)
          const taskRes = response.data;

          setMyTodayTasks(taskRes.filter(e => e.Assignee.ID === UID))
          setTodayCompleted(taskRes.filter(e => e.Assignee.ID === UID && e.Task_Status === "Completed"))
          setTodayInprog(taskRes.filter(e => e.Assignee.ID === UID && e.Task_Status === "In Progress"))
          setTodayNotstarted(taskRes.filter(e => e.Assignee.ID === UID && e.Task_Status === "Not Started"))
        }
        
      })
      .catch((err) => console.error(err))

  }, [UID])




    // FETCHING OVERDUE TASKS
    useEffect(() => {
    if (!UID) return

    const config = {
      app_name: APP_NAME,
      report_name: "My_Team_Tasks",
      criteria: `Assignee.ID==${UID} && Task_Status!="Completed" && Task_Date < "${formattedDate}"`

    }

    ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

      if(response.code === 3000){
        console.log("Over due Tasks Data:", response.data)
        const taskRes = response.data;
        setOverDueTasks(taskRes)
      }
        
      })
      .catch((err) => console.error(err))

  }, [UID])

      // FETCHING PROJECTS COUNT
      const [projectsCount, setProjectsCount] = useState("0");
  useEffect(() => {
    if (!UID) return

    const config = {
      report_name: "My_Team_Projects",
    }

    ZOHO.CREATOR.DATA.getRecordCount(config).then((response) => {
      console.log("MY PROJECTS COUNT:", response)

      if(response.code === 3000){

        setProjectsCount(response.result.records_count)
        
      }
        
      })
      .catch((err) => console.error(err))

  }, [UID])




    const handleSelectTask = (taskID) => {

        const element = document.getElementById("offcanvasRight");
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();

        var config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            id : taskID
        };
        ZOHO.CREATOR.DATA.getRecordById(config).then(function (response) {
            console.log(response,config);
            if(response.code === 3000){
              setSelectedTask(response.data)
            }

        }).catch(e => console.log(e))
        
    };




    const COOLDOWN = 15 * 60 * 1000; // 15 minutes

    const isCooldownActive = lastRefresh !== null && now - lastRefresh < COOLDOWN;

    const remainingMinutes = isCooldownActive
  ? Math.ceil((COOLDOWN - (now - lastRefresh)) / 60000)
  : 0;

    useEffect(() => {
      const saved = localStorage.getItem("lastRefresh");
      if (saved !== null) setLastRefresh(Number(saved));
    }, []);

    useEffect(() => {
      if (lastRefresh) {
        localStorage.setItem("lastRefresh", lastRefresh);
      }
    }, [lastRefresh]);


    const handleRefresh = () => {

      if (loading || isCooldownActive) return;

      setLoading(true);


      var config = {
        form_name: "Function_Call",
        payload: {
          data: {
            Employee : USERID
        }
        }
      };
      ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
        console.log(response);
        if (response.code == 3000) {
          // console.log(response);
          // setLoading(false);
          setLastRefresh(Date.now()); // ✅ START COOLDOWN HERE
          setTriggerApi(p => !p)
        }
      }).catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false); // ✅ always stop spinner
      });

    }

    useEffect(() => {

      if (!isCooldownActive) return;

      const interval = setInterval(() => {
        setNow(Date.now()); // triggers re-render
      }, 1000); // update every second

      return () => clearInterval(interval); // cleanup
    }, [isCooldownActive]);

    const [toasts, setToasts] = useState([]);

    const showToast = (type, message, duration = 3000) => {
  const id = Date.now();

  setToasts((prev) => [
    ...prev,
    { id, type, message, duration },
  ]);
};

const removeToast = (id) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
};


const TaskBadge = ({ status }) => {
  const badgeStyles = {
    "Not Started": {
      bg: "not-started",
      text: "not-started",
      icon: "bi-hourglass",
    },
    "In Progress": {
      bg: "in-progress",
      text: "in-progress",
      icon: "bi-stopwatch",
    },
    "Completed": {
      bg: "bg-success-subtle",
      text: "text-success",
      icon: "bi-check-circle",
    },
    "Pause": {
      bg: "pause",
      text: "pause",
      icon: "bi-pause-circle-fill",
    },
  };

  const style = badgeStyles[status] || {
    bg: "bg-light",
    text: "text-dark",
    icon: "bi-question-circle",
  };

  return (
    <div className={`badge ${style.bg} py-2 `}>
      <i className={`bi ${style.icon} ${style.text} fw-semibold fs-6`}></i>
    </div>
  );
};



  return (
    <div className=' pt-4 px-4' style={{ marginLeft: "70px", backgroundColor:"#FCF8FF" }} >

      {/* <button onClick={() => showToast("success", "Project created successfully!", 10000)}>
          Success
        </button>

        <button onClick={() => showToast("info", "Project created successfully!")}>
          warning
        </button> */}


      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />



<article>

<section className="app-stats pb-2 ">
  <div className="">
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-2">

      {/* Total Tasks */}
      <div className="col">
        <div className="stat-card d-flex align-items-center bg-white p-4  shadow-sm rounded-4">
          <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-pink-subtle" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-card-heading fs-4 text-pink"></i>
          </div>
          <div className="ms-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0" >Projects</p>
            <h3 className="fs-4 fw-bold mb-0">{projectsCount}</h3>
          </div>
        </div>
      </div>
      
      {/* Total Tasks */}
      <div className="col">
        <div className="stat-card d-flex align-items-center bg-white p-4 shadow-sm rounded-4">
          <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-clipboard-data fs-4 text-primary"></i>
          </div>
          <div className="ms-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0">Total Tasks</p>
            <h3 className="fs-4 fw-bold mb-0">{myTodayTasks.length}</h3>
          </div>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="col">
        <div className="stat-card d-flex align-items-center bg-white p-4 shadow-sm rounded-4">
          <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-success-subtle" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-check2-circle fs-4 text-success"></i>
          </div>
          <div className="ms-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0">Completed Tasks</p>
            <h3 className="fs-4 fw-bold mb-0">{todayCompleted.length}</h3>
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div className="col">
        <div className="stat-card d-flex align-items-center bg-white p-4 shadow-sm rounded-4">
          <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-warning-subtle" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-three-dots fs-4 text-warning"></i>
          </div>
          <div className="ms-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0">In Progress</p>
            <h3 className="fs-4 fw-bold mb-0">{todayInprog.length}</h3>
          </div>
        </div>
      </div>

      {/* Not Started */}
      <div className="col">
        <div className="stat-card d-flex align-items-center bg-white p-4 shadow-sm rounded-4">
          <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-info-subtle" style={{ width: '50px', height: '50px' }}>
            <i className="bi bi-hourglass fs-4 text-info"></i>
          </div>
          <div className="ms-3">
            <p className="text-uppercase small fw-semibold text-muted mb-0">Not Started</p>
            <h3 className="fs-4 fw-bold mb-0">{todayNotStarted.length}</h3>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>



</article>





<div className='row g-2'>

        <div className="col-5 mb-1" style={{height:"300px"}}>
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100">

              
              <div className="card-body scroll-karo p-4 py-3">

                <span className=" fw-medium mb-3 " style={{fontSize:"18px",color:"#8593e8"}}>Today's Biometric Data 
                   {!remainingMinutes && <i
                      onClick={!loading && !isCooldownActive ? handleRefresh : undefined}
                      className={`bi bi-arrow-clockwise cursor-pointer ms-3 ${
                        loading ? "spin" : ""
                      } ${isCooldownActive ? "opacity-50 cursor-not-allowed" : ""}`}
                      
                    ></i>}
                    <small className='text-small ms-3 text-mute' style={{fontSize:"10px"}}>{remainingMinutes > 0 && remainingMinutes}</small>
                </span>

                    <HomePunch triggerApi={triggerApi} />

                    <img className='fingerprint ' src="https://cdn-icons-png.flaticon.com/128/9796/9796333.png" alt="" />


              </div>
            </div>
        </div>

        <div className="col-4" style={{height:"300px"}}>

            {/* <Timesheet/> */}

            <TodayTimesheet />

        </div>

        <div className="col-3" style={{height:"300px"}}>

          <Announcements/>
          
        </div>


        <div className="col-4" style={{height: "400px"}}>
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden homecards h-100">
              {/* <div className='card-header'>My Overdue Tasks - {overDueTasks.length}</div> */}
              <div className="card-header bg-white border-0 pb-1">        
                <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#ff8595"}}> 
                  <i className="bi bi-clipboard-x me-2"></i>My Overdue Tasks - {overDueTasks.length} </span>
              </div>

              <div className="card-body scroll-karo" >
                
                {/* {overDueTasks.map((e,i) => {
                      return(
                        <div key={i} className={`tasklist card mb-3 border-0 rounded-3 shadow-sm  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 '>
                                  <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span>
                                </div>
                            </div>
                         
                        </div>
                      )
                  })} */}
                  {overDueTasks.map((e,i) => {
                      return(
                        <div key={i} className={`tasklist mb-1`}>
                         
                            <div className="row p-2">
                              <div className="col-1 py-2">
                                
                                <TaskBadge status={e.Task_Status} />
                              </div>
                                <div className='col-8 ps-3'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 text-center h-100 align-items-center'>
                                  <span className={`bg-status ${getPriorityBorder(e.Task_Priority)}`}>{e.Task_Priority || ""}</span>
                                </div>
                            </div>
                         
                        </div>
                      )
                  })}  

                  {overDueTasks.length === 0 && (
                    <div className="h-100 text-center align-items-center  opacity-50 my-5">
                                    <img src="https://cdn-icons-png.flaticon.com/128/2839/2839016.png" width="120px" alt="" />
                                    <br /><br />
                                    <small className="text-center text-muted mt-4">No Overdue tasks</small>
                                </div>
                  )}
              </div>
            </div>
        </div>



        <div className="col-4 mb-1" style={{height: "400px"}}>
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden homecards h-100" >
              <div className="card-header bg-white border-0 pb-1">        
                <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#8593e8"}}> 
                  <i className="bi bi-clipboard-data me-2"> </i>Today's Tasks - {myTodayTasks.length} </span>
              </div>
              <div className="card-body scroll-karo" >
                
                    {myTodayTasks.map((e,i) => {
                      
                      return(
                        <div key={i} className={`tasklist mb-1`}>
                         
                            <div className="row p-2">
                              <div className="col-1 py-2">
                                
                                <TaskBadge status={e.Task_Status} />
                              </div>
                                <div className='col-8 ps-3'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
                                  <small className='text-muted text-uppercase' style={{fontSize:"12px"}}>{e.Project_Name?.Project_Name || "No Project"}</small>
                                </div>
                                <div className='col-3 text-center h-100 align-items-center'>
                                  {/* <span className={`bg-status ${e.Task_Status.toLowerCase().replace(" ", "-") || "not-started"}`}>{e.Task_Status || "Not Started"}</span> */}
                                  <span className={`bg-status ${getPriorityBorder(e.Task_Priority)}`}>{e.Task_Priority || ""}</span>
                                </div>
                            </div>
                         
                        </div>
                      )
                    })}
                    {/* https://cdn-icons-png.flaticon.com/128/3281/3281289.png */}

                    {myTodayTasks.length === 0 && (
                                <div className="h-100 text-center align-items-center my-5">
                                    <img className='opacity-25' src="https://cdn-icons-png.flaticon.com/128/3281/3281289.png" width="80px" alt="" />
                                    <br />
                                    <small className="text-center text-muted opacity-50">Today's Task is Empty</small>
                                </div>
                  )}
                
              </div>
            </div>
        </div>

        <div className="col-4" style={{height:"295px"}}>

            <Timesheet/>

            <div>
              <UpcomingHolidays/>
            </div>

        </div>

        


        {ORG === "NMG" && (
          <div className="col-6">
            <div className="card border-0 rounded-4 shadow-sm homecards" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>BTR Events - {myTodayTasks.filter(e => e["Project_Name.Project_Group1"]?.Project_Group === "Business Tax Filing").length}</span>
              <div className="card-body scroll-karo" >
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"]?.Project_Group === "Business Tax Filing").map(e => {
                      return(
                        <div key={e.ID} className={` tasklist card mb-3 border-0 rounded-3 shadow-sm  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
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
        )}


        {ORG === "NMG" && (

          <div className="col-6">
            <div className="card border-0 rounded-4 shadow-sm homecards" style={{height: "500px"}}>
              <span className='cardsHeader ms-3 mt-2'>ITR Events - {myTodayTasks.filter(e => e["Project_Name.Project_Group1"]?.Project_Group === "Individual Tax Filing").length}</span>
              <div className="card-body scroll-karo" >
                
                    {myTodayTasks.filter(e => e["Project_Name.Project_Group1"]?.Project_Group === "Individual Tax Filing").map(e => {
                      return(
                        <div key={e.ID} className={` tasklist card mb-3 border-0 rounded-3 shadow-sm  ${getPriorityBorder(e.Task_Priority)}`}>
                         
                            <div className="row p-3 py-2">
                                <div className='col-9'>
                                  <p onClick={() => handleSelectTask(e.ID)} className='d-block cursor-pointer'>{e.Task_Name}</p>
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

        )}

        

        


</div>

<br /><br />





<OffcanvasTaskDetails selectedEvent={selectedTask} setSelectedEvent={setSelectedTask}  />



    </div>
  )
}

export default Home