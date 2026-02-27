import {useEffect, useState} from 'react'
import MyBigCalendar from '../components/cal/MyBigCalendar'
import { APP_NAME } from '../config'
import { useUser } from '../context/UserContext'
import AdminBigCalendar from '../components/cal/AdminBigCalendar'
import { Link, Outlet } from 'react-router-dom'

const Calendar = () => {


    // const {USERID} = useUser();
    // const [allTask, setAllTask] = useState([]);

    // useEffect(() => {
    //     if (!USERID) return
    
    //     const config = {
    //       app_name: APP_NAME,
    //       report_name: "My_Team_Tasks",
    //       criteria: `Assignee.ID==${USERID}`,
    //       max_records : 1000

    //     }
    
    //     ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
    //         if(response.code === 3000){
    //           console.log("My All Tasks for Calendar:", response.data)
    //           const taskRes = response.data;

    //             setAllTask(taskRes)
              
    //         }
            
    //       })
    //       .catch((err) => console.error(err))
    
    // }, [USERID])

    // useEffect(() => {
    //     if (!USERID) return
    
    //     const config = {
    //       app_name: APP_NAME,
    //       report_name: "Task_Report",
    //       criteria: `Task_Date!=null`,
    //       max_records : 1000
          
    //     }
    
    //     ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
    //         if(response.code === 3000){
    //           console.log("My All Tasks for Calendar:", response.data)
    //           const taskRes = response.data;

    //             setAllTask(taskRes)
              
    //         }
            
    //       })
    //       .catch((err) => console.error(err))
    
    // }, [USERID])






  return (
    <>
    
    <div className="ms-5 position-absolute" style={{left:"10%"}}>
      
      {/* <Link to="">My Calendar</Link> */}

      {/* <Link to="admincalendar">Team Calendar</Link> */}

    </div>

      <Outlet />

    
   
    {/* <MyBigCalendar allTask={allTask} /> */}

    {/* <AdminBigCalendar allTask={allTask} /> */}
    
    
    </>
  )
}

export default Calendar