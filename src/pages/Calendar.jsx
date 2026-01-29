import {useEffect, useState} from 'react'
import MyBigCalendar from '../components/cal/MyBigCalendar'
import { APP_NAME } from '../config'
import { useUser } from '../context/UserContext'

const Calendar = () => {


    const {USERID} = useUser();
    const [allTask, setAllTask] = useState([]);

    useEffect(() => {
        if (!USERID) return
    
        const config = {
          app_name: APP_NAME,
          report_name: "My_Team_Tasks",
          criteria: `Assignee.ID==${USERID}`
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
            if(response.code === 3000){
              console.log("My All Tasks for Calendar:", response.data)
              const taskRes = response.data;

                setAllTask(taskRes)
              
            }
            
          })
          .catch((err) => console.error(err))
    
    }, [USERID])






  return (
    <>
    
      
    
   
    <MyBigCalendar allTask={allTask} />
    
    
    </>
  )
}

export default Calendar