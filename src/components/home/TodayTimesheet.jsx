import {React, useState,useEffect} from 'react'
import { formattedDate } from '../../config';
import { useUser } from '../../context/UserContext';
import { tr } from 'date-fns/locale';

function getTime(input) {
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4} (0[1-9]|1[0-2]):[0-5]\d:[0-5]\d (AM|PM)$/;

  if (!regex.test(input)) {
    return "";
  }

  return input.substring(11, 19).replace(/:\d{2}$/, "");
}

function removeSeconds(time) {
    if(!time){
        return "";
    }
  return time.replace(/:\d{2}\s/, ' ');
}

// console.log(removeSeconds("02:30:00 PM"));

const TodayTimesheet = () => {

    const {USERID} = useUser();

    const [logs, setLogs] = useState([])
    const [worked, setWorked] = useState(null)

        useEffect(() => {
          const fetchLogs = async () => {
            try {
              const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "All_Logs", criteria: `Date_field == '${formattedDate}' && Employee==${USERID}`})
      
              console.log("Logs", res)

              
      
              if(res.code == 3000){
                  setLogs(res.data);
                  const totalMinutes = res.data.reduce((sum, e) => {
                        const match = e.Hours_Worked.match(/(\d+)h\s*(\d+)m/);

                        if (!match) return sum;

                        const hours = parseInt(match[1], 10);
                        const minutes = parseInt(match[2], 10);

                        return sum + hours * 60 + minutes;
                    }, 0);

                    const totalHours = Math.floor(totalMinutes / 60);
                    const remainingMinutes = totalMinutes % 60;

                    setWorked(`${totalHours}h ${remainingMinutes}m`);

              }
      
            } catch (err) {
              console.error(err);
            }
          };
      
          fetchLogs();

        }, [USERID]);


  return (
    <div className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100">
        <div className="card-header bg-white border-0 pb-1">        
            <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#8593e8"}}> 
            <i className="bi bi-stopwatch me-2"></i> Today's Timesheet 
                {worked && (<span className='bg-status bg-green fw-bold ms-1' style={{fontSize:"12px"}}>{worked}</span>)}
            </span>
        </div>
        <div className="card-body pt-1 scroll-karo ">

            <table className='table'>
                <thead>
                    <tr>
                        <th style={{fontSize:"12px"}} className='text-muted text-uppercase small'>Task</th>
                        <th style={{fontSize:"12px"}} className='text-muted text-uppercase small'>Timing</th>
                        <th style={{fontSize:"12px"}} className='text-muted text-uppercase small'>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(e => ( 

                        <tr>
                            <td className='small'><span style={{fontSize:"13px"}}>{e?.Task?.Task_Name}</span></td>
                            <td className='small '><span style={{fontSize:"11px"}}>{removeSeconds(e?.Started?.split(" ")?.slice(1).join(" "))} - {removeSeconds(e?.Ended.split(" ")?.slice(1).join(" "))}</span></td>
                            <td className='small' style={{width: "20%"}}><span className='bg-status bg-green text-success fw-bold'>{e?.Hours_Worked}</span></td>
                        </tr>

                    ))}

                    {/* {worked && (
                        <tr className='text-end w-100'>
                            <td colSpan="3" className='text-end'>
                                <span className='bg-status bg-green text-success fw-bold'>{worked}</span>
                            </td>
                        </tr>
                    )} */}

                    {logs.length === 0 && (
                        <tr>
                            <td colSpan="3" className='text-center table-borderless border-0'>
                                <div className="h-100 text-center align-items-center  opacity-25 my-5">
                                    <img src="https://cdn-icons-png.flaticon.com/128/7486/7486753.png" width="80px" alt="" /><br />
                                    {/* <small className="text-center text-muted">No Logs Yet :)</small> */}
                                </div>
                            </td>
                        </tr>
                    )}
                    
                </tbody>
            </table>

        </div>
    </div>
  )
}

export default TodayTimesheet