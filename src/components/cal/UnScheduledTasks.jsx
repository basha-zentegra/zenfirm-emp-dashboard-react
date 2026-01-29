import {useEffect, useState} from 'react'
import { APP_NAME } from '../../config';
import { useUser } from '../../context/UserContext';

const UnScheduledTasks = () => {




      const {USERID} = useUser();

      const [unsTasks, setUNSTasks] = useState([]);
  
      useEffect(() => {
          if (!USERID) return
      
          const config = {
            app_name: APP_NAME,
            report_name: "My_Team_Tasks",
            criteria: `Assignee.ID==${USERID} && Task_Date=="" && Start_Time == ""`
          }
      
          ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
      
              if(response.code === 3000){
                console.log("UNS Tasks:", response.data)
                const taskRes = response.data;
  
                  setUNSTasks(taskRes)
                
              }
              
            })
            .catch((err) => console.error(err))
      
      }, [USERID])

      


  return (
    <>



    <div className="offcanvas offcanvas-end" tabIndex="-1" id="unscheduledOffcanvass" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
        <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="taskOffcanvasLable"></h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">

            {unsTasks.length > 0 && unsTasks.map(element => (
              <div>{element?.Task_Name}</div>
            ))}

        </div>

    </div>




    </>
  )
}

export default UnScheduledTasks