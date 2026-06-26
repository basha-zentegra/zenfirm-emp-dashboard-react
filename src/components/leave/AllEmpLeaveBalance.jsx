import {useEffect, useState} from 'react'
import { startOfMonth } from "../../utils/dateUtils";

const  AllEmpLeaveBalance = () => {

    const [leaves, setLeaves] = useState([]);
    const [search, setSearch] = useState("");

    const filteredLeaves = leaves.filter((leave) => {
      const employeeName =
        leave?.["Leave_Balance_Form.Employee"]?.Name || "";

      return employeeName.toLowerCase().includes(search.toLowerCase());
    });


    function fetchLeaves(){

        const config = {
          report_name: "Leave_History_Report",
          criteria: `Month_field=='${startOfMonth()}'`

        }

        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
            if(response.code === 3000){
                
                const leaveRes = [...response.data].sort((a, b) =>
                  a?.["Leave_Balance_Form.Employee"]?.Name.localeCompare(b?.["Leave_Balance_Form.Employee"]?.Name)
                );

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


<div className="container mt-3">
  <div className="card shadow-sm border-0">
    

    {/* Table */}
    <div className="card-body">

      

<div className="row mb-3">
  <div className="col-md-9">
    <h5 className="mb-4 fw-semibold">All Employee Leave Balance</h5>
  </div>
  <div className="col-md-3">
    <input
      type="text"
      className="form-control"
      placeholder="Search employee..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
</div>

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
            {filteredLeaves.map((e, index) => {              

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