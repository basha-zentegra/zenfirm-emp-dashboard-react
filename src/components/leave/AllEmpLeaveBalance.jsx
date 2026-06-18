import {useEffect, useState} from 'react'
import { startOfMonth } from "../../utils/dateUtils";

const  AllEmpLeaveBalance = () => {

    const [leaves, setLeaves] = useState([]);



    function fetchLeaves(){

        const config = {
          report_name: "Leave_History_Report",
          criteria: `Month_field=='${startOfMonth()}'`

        }

        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
            if(response.code === 3000){
                const leaveRes = response.data;
                // console.log(leaveRes)
                setLeaves(leaveRes);
            }
            
        })
        .catch((err) => console.error(err))
    }


    useEffect(() =>{
        fetchLeaves()
    },[])


  return (
    <div>


<div className="container mt-5">
  <div className="card shadow-sm border-0">
    

    {/* Table */}
    <div className="card-body">

      <h5 className="mb-4 fw-semibold">ALL EMPLOYEE LEAVE BALANCE</h5>

      <div className="table-responsive">
        <table className="table table-hover align-middle leave-request-table">
          <thead className="text-muted my-thead text-uppercase">
            <tr className='text-muted'>
              <th className='text-muted fw-normal'>#</th>
              <th className='text-muted fw-normal'>Employee Name</th>
              <th  className='text-muted fw-normal'>Casual Leave</th>
              <th className='text-muted fw-normal'>Sick Leave</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((e, index) => {

              console.log(e)

              

              return (
                <tr key={e.id || index}>
                  <td>{index + 1}</td>

                  <td className="fw-semibold">
                    {e?.["Leave_Balance_Form.Employee"]?.Name || "N/A"}
                  </td>

                  <td>
                    <span className="badge text-dark  px-3 py-2">
                      {e?.Balance_Casual_Leave || "-"}
                    </span>
                  </td>

                  <td>
                    <span className="badge  text-dark px-3 py-2">
                      {e?.Balance_Sick_Leave || "-"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
    
    </div>
  )
}

export default AllEmpLeaveBalance