import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext'
import '../../css/leave.css'
import { startOfMonth } from '../../utils/dateUtils'





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
    <div className="container mt-3">
      <div className="card shadow-sm border-0 rounded-4">

        <div className="card-body">

            <h5 className="mb-4 fw-semibold">Credit History</h5>

            <div className="table-responsive rounded-4">
            <table className="table table-bordere table-hover mb-0 leave-request-table rounded-4">
                <thead className="table-primar text-muted my-thead text-uppercase">
                <tr>
                    <th className='text-muted fw-normal'>#</th>
                    <th className='text-muted fw-normal'>Month</th>
                    <th className='text-muted fw-normal'>Eligible Sick</th>
                    <th className='text-muted fw-normal'>Eligible Casual</th>
                    
                    <th className='text-muted fw-normal'>Used Sick</th>
                    <th className='text-muted fw-normal'>Used Casual</th>
                    
                    <th className='text-muted fw-normal'>Balance Sick</th>
                    <th className='text-muted fw-normal'>Balance Casual</th>
                    
                    <th className='text-muted fw-normal'>LOP</th>
                </tr>
                </thead>

                <tbody>
                {history?.map((e, index) => (
                    <tr key={e.ID || index} className={`${e.Month_field === startOfMonth() ? 'table-success fw-bold' : ''}`}>
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{index + 1}</td>
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Month_field}</td>
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Eligible_Sick_Leave}</td>
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Eligible_Casual_Leave}</td>
                        
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Used_Sick_Leave}</td>
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Used_Casual_Leave}</td>
                        
                        <td className={`${e.Balance_Sick_Leave === "0.00" ? "text-danger fw-semibold" : ""} ${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.Balance_Sick_Leave}</td>
                        <td className={`${e.Balance_Casual_Leave === "0.00" ? "text-danger fw-semibold" : ""} ${e.Month_field === startOfMonth() ? 'text-success' : ''}`} >{e.Balance_Casual_Leave}</td>
                        
                        <td className={`${e.Month_field === startOfMonth() ? 'text-success' : ''}`}>{e.LOP}</td>
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