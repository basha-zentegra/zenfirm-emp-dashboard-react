import {useState, useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { isFutureDate } from '../../utils/dateUtils';
import { formattedDate } from '../../config';



  const getStatusBadge = (status) => {
    const base = "badge px-3 py-2 fw-medium";

    switch (status) {
      case "Approved":
        return <span className={`${base} bg-approved text-success`}>● Approved</span>;
      case "Rejected":
        return <span className={`${base} bg-danger-subtle text-danger`}>● Declined</span>;
      case "Revoked":
        return <span className={`${base} bg-primary-subtle text-primary`}>● Revoked</span>;
      default:
        return <span className={`${base} bg-warning-subtle text-warning`}>● Pending</span>;
    }
  };

const MyLeaveRequests = () => {

    const {USERID} = useUser();

    const [leaves, setLeaves] = useState([]);
    const [longLeaves, setLongLeaves] = useState([]);

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

    useEffect(() => {
    const fetchLongLeaves = async () => {
      try {
        const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Long_Leave_Report", criteria: `Employee.ID ==${USERID} && From > '${formattedDate}'`})

        console.log("Long Leave",res)

        if(res.code == 3000){
            setLongLeaves(res.data);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchLongLeaves();
  }, []);

  const handleAction = (id, action) => {

        var config = {
                report_name: "My_Leaves",
                id: id,
                payload: {
                  data: {
                    Approval_status: action,
                  }
                }
        };

        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
          console.log(response);
          if (response.code == 3000) {
              setLeaves((prev) => prev.map((leave) => leave.ID === id ? { ...leave, Approval_status: "Revoked"} : leave));
          } 
        }).catch(e => console.warn(e))

    
  };


  return (
    <div className="container mt-3">
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
                  <th className="text-muted fw-normal">Approved by</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {longLeaves.map(leave => (

                  <tr key={leave.ID} className="tr-hight">
                    <td className="fw-medium">{leave?.Employee?.Name || "Name"}</td>
                    <td>Long Leave</td>
                    <td><small className="text-muted">{leave?.From} to {leave?.To}</small></td>
                    <td>{leave?.No_of_Days_Leave}</td>
                    <td className="">{getStatusBadge(leave?.Approval_Status)}</td>
                    <td>{leave?.Reason}</td>
                    <td>{leave?.Approved_by?.Name || ""}</td>
                    
                    <td></td>
                    
                  </tr>

                )) }
                {leaves.map((leave) => (
                  <tr key={leave.ID} className="tr-hight">
                    <td className="fw-medium">{leave?.Employee_Name?.Name || "Name"}</td>
                    <td>{leave?.Leave_Type1 || "-"}</td>
                    <td><small className="text-muted">{leave?.From} to {leave?.To}</small></td>
                    <td>{leave?.No_Of_Days_Leave}</td>
                    <td className="">{getStatusBadge(leave?.Approval_status)}</td>
                    <td>{leave?.Comments}</td>
                    <td>{leave?.Approved_by?.Name || ""}</td>
                    

                    <td className="text-end">
                      

                      {leave?.Approval_status === "Approved" && isFutureDate(leave?.From) && (
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-light"
                            data-bs-toggle="dropdown"
                            disabled={leave?.Approval_status === "" || leave?.Approval_status === "Rejected"}
                          >
                            ⋮
                          </button>

                          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                            
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleAction(leave.ID, "Revoked")}
                                style={{opacity: leave?.Approval_status !== "Approved" ? '0.5' : '1'}}
                              >
                                <i class="bi bi-backspace-reverse"></i> Revoke
                              </button>
                            </li>
                            
                          </ul>
                        </div>
                      )}


                    </td>
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