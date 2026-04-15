import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext'
import '../../css/leave.css'





const LeaveHistory = () => {

    const [history, setHistory] = useState([])
    const {USERID} = useUser()

    useEffect(()=>{

        fetchLeaveHistory()

    },[])

    function fetchLeaveHistory(){
        const config = {
                report_name: "All_Leave_Balances",
                criteria: `Employee.ID==${USERID}`
        }
        
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        
            if(response.code === 3000){
                console.log("Leave History:", response.data)
                setHistory(response.data[0]?.Leave_History)
                
            }
        
        }).catch((err) => console.error(err))
    }



  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0">

        <div className="card-body">

            <h5 className="mb-4 fw-semibold">Credit History</h5>

            <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0 leave-request-table">
                <thead className="table-primary">
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Eligible Casual</th>
                    <th>Eligible Sick</th>
                    <th>Used Casual</th>
                    <th>Used Sick</th>
                    <th>Balance Casual</th>
                    <th>Balance Sick</th>
                    <th>LOP</th>
                </tr>
                </thead>

                <tbody>
                {history?.map((e, index) => (
                    <tr key={e.ID || index}>
                    <td>{index + 1}</td>
                    <td>{e.Month_field}</td>
                    <td>{e.Eligible_Casual_Leave}</td>
                    <td>{e.Eligible_Sick_Leave}</td>
                    <td>{e.Used_Casual_Leave}</td>
                    <td>{e.Used_Sick_Leave}</td>
                    <td className={e.Balance_Casual_Leave === "0.00" ? "text-danger fw-semibold" : ""}>{e.Balance_Casual_Leave}</td>
                    <td className={e.Balance_Sick_Leave === "0.00" ? "text-danger fw-semibold" : ""}>{e.Balance_Sick_Leave}</td>
                    <td>{e.LOP}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

        </div>
      </div>
    </div>
  )
}

export default LeaveHistory