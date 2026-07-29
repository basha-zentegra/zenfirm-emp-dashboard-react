import {useState, useEffect} from 'react'
import { convertTo24Hour,calculateWorkedTime } from '../../utils/logsUtils';
import { inputToMMDDYYYY,isFuture, MMDDYYYY_TO_YYYYMMDD } from '../../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';
import { useUser } from '../../context/UserContext';

const TaskLogs = ({selectedEvent, setIsLogAvailable, setSelectedEvent}) => {

    const {USERID} = useUser();

    const [logs, setLogs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isFutureTask, setIsFutureTask] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);



    const [manualLog, setManualLog] = useState({
        Date_field: new Date().toISOString().split("T")[0],
        Work_Started: "",
        Work_Ended: "", 
        Task: "",
        Description:""
    });

    useEffect(() => {
        if(logs.length > 0) {

            setIsLogAvailable(true)

        }else{
            
            setIsLogAvailable(false)
            
        }
    },[logs])

    useEffect(()=> {

        console.log("Selected event", selectedEvent)

        if(!selectedEvent) return;

        setLogs(selectedEvent?.Logs || [])

        setManualLog({
            Date_field: MMDDYYYY_TO_YYYYMMDD(selectedEvent?.Task_Date),
            Work_Started: convertTo24Hour(selectedEvent?.Start_Time) || "",
            Work_Ended: convertTo24Hour(selectedEvent?.End_Time) || "",
            Task: selectedEvent?.ID,
            Description:""
        })

        if(isFuture(selectedEvent?.Task_Date) || selectedEvent?.Task_Status === "Completed" || selectedEvent?.Task_Status === "Approved"){
            setIsAdding(false)
            setIsFutureTask(true)
        }else{
            setIsFutureTask(false)
        }

    },[selectedEvent])


    const startAdding = () => {
        setIsAdding(prev => !prev)
    }


    const fetchLogsByDate = async (date) => {
        const config = {
            report_name: "All_Logs", // your report link name
            criteria: `(Date_field == "${date}" && Task!=null && Task.Assignee == ${USERID})`
        };

        try {
            const response = await ZOHO.CREATOR.DATA.getRecords(config);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching logs", err);
            return [];
        }
    };

    const isOverlapping = (newStart, newEnd, existingStart, existingEnd) => {
        return newStart < existingEnd && newEnd > existingStart;
    };


    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const getCurrentTimeInMinutes = () => {
        const indiaTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
        });

        const date = new Date(indiaTime);

        return date.getHours() * 60 + date.getMinutes();
    };

    const isToday = (dateStr) => {
        const today = new Date();
        // const formattedToday = inputToMMDDYYYY(today);
        const formattedToday = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
        return dateStr === formattedToday;
    };


    //test and deploy the feature...

    const submitManualLog = async  () => {

        const formattedDate = inputToMMDDYYYY(manualLog.Date_field);

        const newStart = timeToMinutes(manualLog.Work_Started);
        const newEnd = timeToMinutes(manualLog.Work_Ended);

        if (newStart >= newEnd) {
            alert("End time must be after start time");
            return;
        }

        // 🚨 NEW VALIDATION: Future time restriction
        if (isToday(formattedDate)) {
            const currentTime = getCurrentTimeInMinutes();

            console.log(newStart , currentTime , newEnd , currentTime)

            if (newStart > currentTime || newEnd > currentTime) {
                alert("❌ Cannot log future time for today!");
                return;
            }
        }

        // 🚨 Step A: Fetch existing logs
        const existingLogs = await fetchLogsByDate(formattedDate);

        // 🚨 Step B: Check overlap
        const hasOverlap = existingLogs.some(log => {
            const existingStart = timeToMinutes(convertTo24Hour(log.Work_Started));
            const existingEnd = timeToMinutes(convertTo24Hour(log.Work_Ended));

            return isOverlapping(newStart, newEnd, existingStart, existingEnd);
        });

        if (hasOverlap) {
            alert("❌ Time overlaps with an existing log!");
            return;
        }


        var config = {
            form_name: "Logs",
            payload: {
                data: {
                    ...manualLog,
                    Date_field:inputToMMDDYYYY(manualLog.Date_field),
                    Hours_Worked: calculateWorkedTime(manualLog.Work_Started, manualLog.Work_Ended),
                    

                }
            }
        };


        ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
            console.log(response, config);
            if (response.code == 3000) {
                console.log("scccessss")
                setIsAdding(false)
                setLogs(prev => [...prev, {...manualLog,
                    Date_field:inputToMMDDYYYY(manualLog.Date_field),
                    Hours_Worked: calculateWorkedTime(manualLog.Work_Started, manualLog.Work_Ended),
                    ID: response.data.ID
                 }])

                 const newLog = {...manualLog,
                    Date_field:inputToMMDDYYYY(manualLog.Date_field),
                    Hours_Worked: calculateWorkedTime(manualLog.Work_Started, manualLog.Work_Ended),
                    ID: response.data.ID
                 }

                    setSelectedEvent(prev => ({
                        ...prev,
                        Logs: [...(prev.Logs || []), newLog],
                    }));

                    setManualLog({
                        Date_field: MMDDYYYY_TO_YYYYMMDD(selectedEvent?.Task_Date),
                        Work_Started: convertTo24Hour(selectedEvent?.Start_Time) || "",
                        Work_Ended: convertTo24Hour(selectedEvent?.End_Time) || "",
                        Task: selectedEvent?.ID,
                        Description:""
                    })
                
            }
        });
    }



    useEffect(()=>{
        document.getElementById("taskdetailsclsbtn").addEventListener("click", function(){
            setIsAdding(false)
        })
    },[])

  const confirmDelete = () => {

    if(!logToDelete) return;

    var config = {
      report_name: "All_Logs",
      id: logToDelete,

    };
    ZOHO.CREATOR.DATA.deleteRecordById(config).then(function (response) {
        console.log(response);
      if (response.code == 3000) {
        

            const newUpdated = logs.filter((log) => log.ID !== logToDelete);
            setLogs(newUpdated)
            setSelectedEvent(prev => ({
                        ...prev,
                        Logs: newUpdated,
                    }));

            setShowConfirm(false);
            setLogToDelete(null);
      }
    });


  }

    const cancelDelete = () => {
        setShowConfirm(false);
        setLogToDelete(null);
    };

    const handleDeleteClick = (logID) => {
        setLogToDelete(logID);
        setShowConfirm(true);
    };


  return (
    <>

<section className="">     
<div className="card shadow-shopify border-0 mb-4 mt-3 rounded-4">
  <div className="card-body">

            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th className='text-muted'>Date</th>
                    <th className='text-muted'>Start Time</th>
                    <th className='text-muted'>End Time</th>
                    
                    <th className='text-muted'>Description</th>
                    <th className='text-muted'>Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td>{log.Date_field}</td>
                      <td>{log.Work_Started}</td>
                      <td>{log.Work_Ended}</td>
                      <td style={{width:"25%"}} className='small text-muted'>{log.Description || ""}</td>
                      <td>{log.Hours_Worked}</td>
                      <td><i className="bi bi-trash text-danger cursor-pointer" onClick={() => handleDeleteClick(log.ID)}></i></td>
                    </tr>
                  ))}

                  {isAdding && (
                    <tr>
                        <td>
                            <input
                                type="date"
                                className='form-control form-control-sm'
                                max={new Date().toISOString().split("T")[0]}
                                value={manualLog.Date_field}
                                onChange={(e) =>
                                    setManualLog({ ...manualLog, Date_field: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <input
                                type="time"
                                className='form-control form-control-sm'

                                value={manualLog.Work_Started}
                                onChange={(e) =>
                                setManualLog({ ...manualLog, Work_Started: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <input
                                type="time"
                                className='form-control form-control-sm'

                                value={manualLog.Work_Ended}
                                onChange={(e) =>
                                setManualLog({ ...manualLog, Work_Ended: e.target.value })
                                }
                            />
                        </td>

                        <td>
                            <textarea 
                                name="" 
                                id=""
                                className='form-control form-control-sm'
                                rows="1"

                                value={manualLog.Description}
                                onChange={(e) =>
                                    setManualLog({ ...manualLog, Description: e.target.value })
                                }
                            ></textarea>
                        </td>

                        <td>
                            <button className='btn btn-sm' onClick={submitManualLog}><i class="bi bi-arrow-right-circle-fill"></i></button>
                        </td>
                    </tr>
                  )}

                  {!isAdding && (

                    <tr>
                        <td className='text-center' colSpan="5">
                            <button className="btn btn-link text-decoration-none mt-2 btn-sm p-0" onClick={startAdding} disabled={isFutureTask} ><i className="bi bi-plus-circle me-1"></i> Add Log</button>
                        </td>
                    </tr>

                  )}
                  
                


                </tbody>
              </table>
            </div>



  </div>
</div>

</section>

{showConfirm && (
    
    <ConfirmDialog confirmDelete={confirmDelete} cancelDelete={cancelDelete} />
)}



    </>
  )
}

export default TaskLogs