import {useEffect, useState} from 'react'

const AllEmpLeaveBalance = () => {

    const [leaves, setLeaves] = useState([]);



    function fetchLeaves(){
        const config = {
          report_name: "All_Leave_Balances",

        }
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
            if(response.code === 3000){
                const leaveRes = response.data;
                console.log(leaveRes)
                setLeaves(leaveRes);
            }
            
        })
        .catch((err) => console.error(err))
    }


    useEffect(() =>{
        fetchLeaves()
    },[])





  return (
    <div className=''>

    {/* <h1>ALL EMP LEAVE BALANCE</h1>
        {leaves.map(e => {
           

            const balSick = e.Leave_History[e?.Leave_History.length-1] || {}

            

            return( 
                <p>{e.Employee?.Name} - {balSick.Balance_Casual_Leave || "0"} - {balSick.Balance_Sick_Leave || "0"}</p>

            )
        }
            

        )} */}

<div className="container mt-4">
  <div className="card shadow border-0">
    
    {/* Header */}
    <div className="card-header  ">
      <h3 className="mb-0 text-center">ALL EMPLOYEE LEAVE BALANCE</h3>
    </div>

    {/* Table */}
    <div className="card-body p-0">
      <table className="table table-hover table-striped mb-0">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Employee Name</th>
            <th>Casual Leave</th>
            <th>Sick Leave</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((e, index) => {
            const balSick =
              e?.Leave_History?.[e.Leave_History.length - 1] || {};

            return (
              <tr key={e.id || index}>
                <td>{index + 1}</td>

                <td className="fw-semibold">
                  {e?.Employee?.Name || "N/A"}
                </td>

                <td>
                  <span className="badge text-dark  px-3 py-2">
                    {balSick?.Balance_Casual_Leave || "-"}
                  </span>
                </td>

                <td>
                  <span className="badge  text-dark px-3 py-2">
                    {balSick?.Balance_Sick_Leave || "-"}
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
  )
}

export default AllEmpLeaveBalance