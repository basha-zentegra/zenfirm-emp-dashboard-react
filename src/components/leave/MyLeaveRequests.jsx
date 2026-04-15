import {useState, useEffect} from 'react'
import { useUser } from '../../context/UserContext';


const getLeaveType = (sick, casual) => {

  const sickLeave = parseFloat(sick);
  const casualLeave = parseFloat(casual);

//   if (isNaN(sickLeave) || isNaN(casualLeave)) return "No Data";

  if (sickLeave >= casualLeave) {
    return "Sick";
  } else {
    return "Casual";
  }
};

  const getStatusBadge = (status) => {
    const base = "badge px-3 py-2 fw-medium";

    switch (status) {
      case "Approved":
        return <span className={`${base} bg-approved text-success`}>● Approved</span>;
      case "Rejected":
        return <span className={`${base} bg-danger-subtle text-danger`}>● Declined</span>;
      default:
        return <span className={`${base} bg-warning-subtle text-warning`}>● Pending</span>;
    }
  };

const MyLeaveRequests = () => {

    const {USERID} = useUser();

    const [leaves, setLeaves] = useState([]);

  const config = {report_name: "My_Leaves", criteria: `Employee_Name.ID ==${USERID}`}

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await ZOHO.CREATOR.DATA.getRecords(config)

        console.log(res)

        if(res.code == 3000){
            setLeaves(res.data);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchLeaves();
  }, []);


  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-4 fw-semibold">My Requests</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle leave-request-table">
              <thead className="text-muted my-thead text-uppercase">
                <tr className="text-muted">
                  <th className="text-muted fw-normal" >Employee</th>
                  <th className="text-muted fw-normal">Leave Type</th>
                  <th className="text-muted fw-normal">Dates Requested</th>
                  <th className="text-muted fw-normal">Duration</th>
                  <th className="text-muted fw-normal">Status</th>
                  <th className="text-muted fw-normal">Message</th>
                  {/* <th></th> */}
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.ID} className="tr-hight">
                    <td className="fw-medium">{leave?.Employee_Name?.Name || "Name"}</td>
                    <td>{getLeaveType(leave?.Sick_Taken, leave?.Casual_Taken)}</td>
                    <td>{leave?.From}</td>
                    <td>{leave?.No_Of_Days_Leave}</td>
                    <td className="">{getStatusBadge(leave?.Approval_status)}</td>
                    <td>{leave?.Comments}</td>

                    {/* <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light"
                          data-bs-toggle="dropdown"
                        >
                          ⋮
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleAction(leave.ID, "Approved")}
                              disabled={leave?.Approval_status !== ""}
                            >
                              ✅ Approve
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleAction(leave.ID, "Rejected")}
                              disabled={leave?.Approval_status !== ""}
                            >
                              ❌ Reject
                            </button>
                          </li>
                          
                        </ul>
                      </div>
                    </td> */}
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

export default MyLeaveRequests