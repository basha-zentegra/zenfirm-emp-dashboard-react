import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { startOfMonth,getDayName } from "../../utils/dateUtils";

const LeaveManagement = () => {
  
  const {USERID} = useUser();

  const [leaves, setLeaves] = useState([]);
  const [longLeaves, setLongLeaves] = useState([]);
  const [history, setHistory] = useState([]);
  // const [selectedEmpLeave, setSelectedEmpLeave] = useState();

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [longLeavePopUp, setLongLeavePopUp] = useState(false);

  const config = {report_name: "Team_Leave_Approvals"}

  function fetchLeaveHistory(emp){
        const config = {
                report_name: "All_Leave_Balances",
                criteria: `Employee.ID==${emp}`
        }
        
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        
            if(response.code === 3000){
                console.log("Leave History:", response.data)
                setHistory(response.data[0]?.Leave_History)
                
            }
        
        }).catch((err) => console.error(err))
  }

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await ZOHO.CREATOR.DATA.getRecords(config)

        if(res.code == 3000){
            setLeaves(res.data);
            console.log("res",res)
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
          const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Team_Long_Leave_Report"})
  
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

  const buildPayload = (id, action, reason = "", long=false) => {

    if(long===true){
      return {
        report_name: "Long_Leave_Report",
        id: id,
        payload: {
          data: {
            Approval_Status: action,
            Approved_by: USERID,
            ...(reason && { Reject_Reason: reason }) // 👈 key line
          }
        }
      };
    }

    return {
        report_name: "Team_Leave_Approvals",
        id: id,
        payload: {
          data: {
            Approval_status: action,
            Approved_by: USERID,
            ...(reason && { Reject_Reason: reason }) // 👈 key line
          }
        }
      };
  };

  // just reject and chek tomorrow...

  // 🔌 ACTION HANDLERS (HOOK TO API) 
  const handleAction = (id, action, long=false) => {
    console.log(`Action: ${action} for ID: ${id}`);

    let config = '';
    
    if(long){
      config = buildPayload(id, action, rejectReason, long);
    }else{
      config = buildPayload(id, action, rejectReason);
    }
   

    ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
    if (response.code == 3000) {
        console.log(response);

        if(long){
          

          setLongLeaves((prev) =>
              prev.map((leave) =>
                  leave.ID === id
                  ? {
                      ...leave,
                      Approval_Status:
                          action === "Approved"
                          ? "Approved"
                          : action === "Rejected"
                          ? "Rejected"
                          : leave.Approval_Status,
                    }
                  : leave
              )
          );

        }else{
          setLeaves((prev) =>
              prev.map((leave) =>
                  leave.ID === id
                  ? {
                      ...leave,
                      Approval_status:
                          action === "Approved"
                          ? "Approved"
                          : action === "Rejected"
                          ? "Rejected"
                          : leave.Approval_status,
                    }
                  : leave
              )
          );
        }

        

    } });

    
  };


const getLeaveType = (sick, casual) => {

  if (sick == null || casual == null) return "No Data";

  const sickLeave = parseFloat(sick);
  const casualLeave = parseFloat(casual);

  if (isNaN(sickLeave) || isNaN(casualLeave)) return "No Data";


  console.log("ISSUE..",sickLeave, casualLeave )

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
      case "Revoked":
        return <span className={`${base} bg-primary-subtle text-primary`}>● Revoked</span>;
      default:
        return <span className={`${base} bg-warning-subtle text-warning`}>● Pending</span>;
    }
  };



const openPopup = (leave) => {
  setSelectedLeave(leave);
  setIsPopupOpen(true);
  // setSelectedEmpLeave(leave?.Employee_Name?.ID)
  fetchLeaveHistory(leave?.Employee_Name?.ID)
};

const closePopup = () => {
  setSelectedLeave(null);
  setIsPopupOpen(false);
  setLongLeavePopUp(false)
  setRejectMode(false);
  setRejectReason("");
  setHistory([]);
};

const openLongLeavePopup = (leave) => {
  setSelectedLeave(leave);
  setLongLeavePopUp(true);

}

const [rejectMode, setRejectMode] = useState(false);
const [rejectReason, setRejectReason] = useState("");

const lastItem = history?.[history.length - 1];

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-4 fw-semibold">Leave Approvals</h5>


          <div className="table-responsive">
            <table className="table  table-hover align-middle leave-request-table">
              <thead className="text-muted my-thead text-uppercase">
                <tr className="text-muted">
                  <th className="text-muted fw-normal" >Employee</th>
                  <th className="text-muted fw-normal">Leave Type</th>
                  <th className="text-muted fw-normal">Dates Requested</th>
                  <th className="text-muted fw-normal">Duration</th>
                  <th className="text-muted fw-normal">Status</th>
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
                    <td className="text-end">
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => openLongLeavePopup(leave)}

                        >
                          ⋮
                        </button>

                    </td>
                    
                  </tr>

                )) }

                {leaves.map((leave) => (
                  <tr key={leave.ID} className="tr-hight">
                    <td className="fw-medium">{leave?.Employee_Name?.Name || "Name"}</td>
                    <td>{leave?.Leave_Type1 || "-"}</td>
                    <td><small className="text-muted">{leave?.From} to {leave?.To}</small></td>
                    <td>{leave?.No_Of_Days_Leave}</td>
                    <td className="">{getStatusBadge(leave?.Approval_status)}</td>

                    <td className="text-end">
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => openPopup(leave)}

                        >
                          ⋮
                        </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

{longLeavePopUp && selectedLeave && (
   <div className="custom-modal-overlay" onClick={closePopup}>
    <div
      className="custom-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h5>Leave Details</h5>
        <button className="close-btn" onClick={closePopup}>✕</button>
      </div>
        
    <section className="container py-4">

<div className="card shadow-sm border-0">
    <div className="card-body">
      <h6 className="fw-bold mb-3 text-primary">Applied Leave Details</h6>

      <div className="row mb-2">
        <div className="col-md-6">
          <small className="text-muted">Employee</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.Employee?.Name}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Leave Type</small>
          <p className="fw-semibold mb-1">
            Long Leave
          </p>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-6">
          <small className="text-muted">Duration</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.From} → {selectedLeave?.To}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Days</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.No_of_Days_Leave}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Status</small>
          <div>{getStatusBadge(selectedLeave?.Approval_Status)}</div>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Message</small>
          <div>{selectedLeave?.Reason}</div>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Approve/Rejected by</small>
          <div>{selectedLeave?.Approved_by?.Name || "-"}</div>
        </div>
      </div>
    </div>
  </div>



    </section>

<div className="modal-footer">
  {!rejectMode ? (
    <>
      <button
        className="btn btn-success"
        onClick={() => {
          handleAction(selectedLeave.ID, "Approved",true);
          closePopup();
        }}
        disabled={selectedLeave?.Approval_Status !== "Pending"}
      >
        Approve
      </button>

      <button
        className="btn btn-danger"
        onClick={() => setRejectMode(true)}
        disabled={selectedLeave?.Approval_Status !== "Pending"}
      >
        Reject
      </button>
    </>
  ) : (
    <>
      <div style={{ width: "100%" }}>
        <label className="form-label fw-semibold">
          Reason for rejection
        </label>

        <textarea
          className="form-control"
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter reason..."
          autoFocus
          
          
        />
        {!rejectReason.trim() && (
          <small className="text-danger">Reason is required</small>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 w-100 mt-2">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setRejectMode(false);
            setRejectReason("");
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            if (!rejectReason.trim()) return;

            handleAction(selectedLeave.ID, "Rejected", true);
            closePopup();
          }}
          disabled={!rejectReason.trim()}
        >
          Confirm Reject
        </button>
      </div>
    </>
  )}
</div>

    </div>
  </div>
)}


{isPopupOpen && selectedLeave && (
  <div className="custom-modal-overlay" onClick={closePopup}>
    <div
      className="custom-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h5>Leave Details</h5>
        <button className="close-btn" onClick={closePopup}>✕</button>
      </div>
        
<section className="container py-4">

  {/* Leave Balance Card */}
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-body">
      <h6 className="fw-bold mb-3 text-primary">
        {selectedLeave?.Employee_Name?.Name}'s Leave Balance
      </h6>

        <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0 ">
                <thead className="table-primary">
                <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Eligible Sick</th>
                    <th>Eligible Casual</th>
                    
                    <th>Used Sick</th>
                    <th>Used Casual</th>
                    
                    <th>Balance Sick</th>
                    <th>Balance Casual</th>
                    
                    <th>LOP</th>
                </tr>
                </thead>

                <tbody>
                {history?.map((e, index) => (
                    <tr key={e.ID || index} className={`${e.Month_field === startOfMonth() ? 'table-success' : ''}`}>
                        <td>{index + 1}</td>
                        <td>{e.Month_field}</td>
                        <td>{e.Eligible_Sick_Leave}</td>
                        <td>{e.Eligible_Casual_Leave}</td>
                        
                        <td>{e.Used_Sick_Leave}</td>
                        <td>{e.Used_Casual_Leave}</td>
                        
                        <td className={e.Balance_Sick_Leave === "0.00" ? "text-danger fw-semibold" : ""}>{e.Balance_Sick_Leave}</td>
                        <td className={e.Balance_Casual_Leave === "0.00" ? "text-danger fw-semibold" : ""}>{e.Balance_Casual_Leave}</td>
                        
                        <td>{e.LOP}</td>
                    </tr>
                ))}
                </tbody>
          </table>
        </div>

    </div>
  </div>

<div className="card shadow-sm border-0 mb-3">

  <div className="card-body">
    <h6 className="fw-bold mb-3 text-primary">Leave Days Details</h6>
    <div className="row mb-2">
      <div className="col-md-4">
            <small className="text-muted">Date</small>
      </div>
      <div className="col-md-4">
            <small className="text-muted">Type</small>
      </div>
      <div className="col-md-4">
            <small className="text-muted">Session</small>
      </div>

    </div>
    {selectedLeave?.Leave_Days_Details.map( e => {
      return (
        <div className="row mb-2">
          <div className="col-md-4">
            <p className="fw-semibold mb-1">
              {e?.Date_field} <span className="badge bg-primary">{getDayName(e?.Date_field)?.slice(0,3) || "Na"}</span>
            </p>
          </div>
          <div className="col-md-4">
            <p className="fw-semibold mb-1">
              <span className={`${e?.Leave_Type?.Leave_Type === "LOP" ?  'text-danger' : ' '}`}>
                {e?.Leave_Type?.Leave_Type}
              </span>
            </p>
          </div>
          <div className="col-md-4">
            <p className="fw-semibold mb-1">
              {e?.br}
            </p>
          </div>
        </div>
      )
    } )}
  </div>

</div>

  {/* Applied Leave Card */}
  <div className="card shadow-sm border-0">
    <div className="card-body">
      <h6 className="fw-bold mb-3 text-primary">Applied Leave Details</h6>

      <div className="row mb-2">
        <div className="col-md-6">
          <small className="text-muted">Employee</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.Employee_Name?.Name}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Leave Type</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.Leave_Type1}
          </p>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-6">
          <small className="text-muted">Duration</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.From} → {selectedLeave?.To}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Days</small>
          <p className="fw-semibold mb-1">
            {selectedLeave?.No_Of_Days_Leave}
          </p>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Status</small>
          <div>{getStatusBadge(selectedLeave?.Approval_status)}</div>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Message</small>
          <div>{selectedLeave?.Comments}</div>
        </div>

        <div className="col-md-6">
          <small className="text-muted">Approve/Rejected by</small>
          <div>{selectedLeave?.Approved_by?.Name || "-"}</div>
        </div>
      </div>
    </div>
  </div>

</section>

      <div className="modal-footer">
  {!rejectMode ? (
    <>
      <button
        className="btn btn-success"
        onClick={() => {
          handleAction(selectedLeave.ID, "Approved");
          closePopup();
        }}
        disabled={selectedLeave?.Approval_status !== ""}
      >
        Approve
      </button>

      <button
        className="btn btn-danger"
        onClick={() => setRejectMode(true)}
        disabled={selectedLeave?.Approval_status !== ""}
      >
        Reject
      </button>
    </>
  ) : (
    <>
      <div style={{ width: "100%" }}>
        <label className="form-label fw-semibold">
          Reason for rejection
        </label>

        <textarea
          className="form-control"
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter reason..."
          autoFocus
          
          
        />
        {!rejectReason.trim() && (
          <small className="text-danger">Reason is required</small>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 w-100 mt-2">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setRejectMode(false);
            setRejectReason("");
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            if (!rejectReason.trim()) return;

            handleAction(selectedLeave.ID, "Rejected");
            closePopup();
          }}
          disabled={!rejectReason.trim()}
        >
          Confirm Reject
        </button>
      </div>
    </>
  )}
</div>
    </div>
  </div>
)}
















    </div>
  );
};

export default LeaveManagement;