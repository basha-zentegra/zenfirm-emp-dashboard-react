import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { inputToMMDDYYYY,MMDDYYYY_TO_YYYYMMDD, startOfMonth, endOfMonth, getDayName } from "../../utils/dateUtils";

const getStatusBadge = (status) => {
  const base = "badge px-3 py-2 fw-medium";

  switch (status) {
    case "Approved":
      return (
        <span className={`${base} bg-approved text-success`}>
          ● Approved
        </span>
      );
    case "Rejected":
      return (
        <span className={`${base} bg-danger-subtle text-danger`}>
          ● Declined
        </span>
      );
    case "Revoked":
      return (
        <span className={`${base} bg-primary-subtle text-primary`}>
          ● Revoked
        </span>
      );
    default:
      return (
        <span className={`${base} bg-warning-subtle text-warning`}>
          ● Pending
        </span>
      );
  }
};


const AllLongLeaves = () => {
 

    const { USERID } = useUser();
    
      const [allLeaves, setAllLeaves] = useState([]);
      const [leaves, setLeaves] = useState([]);
      const [fromDate, setFromDate] = useState(startOfMonth());
      const [toDate, setToDate] = useState(endOfMonth());
      const [status, setStatus] = useState("All");
    
      const [selectedLeave, setSelectedLeave] = useState(null);
      const [isPopupOpen, setIsPopupOpen] = useState(false);
    
      const fetchLeaves = async (from, to) => {
    
        let config = {report_name: "Long_Leave_Report" };
    
        // if (from && to) {
        //   config.criteria = `From >= "${from}" && From <= "${to}" `;
        // }
    
        try {
          const res = await ZOHO.CREATOR.DATA.getRecords(config);
    
          console.log(res);
    
          if (res.code === 3000) {
            setAllLeaves(res.data || []);
            setLeaves(res.data || []);
          }
        } catch (err) {
          console.error(err);
          setAllLeaves([]);
          setLeaves([])
        }
    
        setStatus("All")
      };
    
      useEffect(() => {
        fetchLeaves();
      }, []);
    
      const handleFilter = () => {
        if (!fromDate || !toDate) {
          alert("Please select both dates");
          return;
        }
    
        fetchLeaves(inputToMMDDYYYY(fromDate), inputToMMDDYYYY(toDate));
      };
    
      const openPopup = (leave) => {
        setSelectedLeave(leave);
        setIsPopupOpen(true);
      }
    
      const closePopup = () => {
        setSelectedLeave(null);
        setIsPopupOpen(false);
      };
    
      const statusFilter = (value) => {
        setStatus(value);
    
        if (value === "All") {
          setLeaves(allLeaves);
        } else {
          const filtered = allLeaves.filter(
            (leave) => leave.Approval_status === value
          );
    
          setLeaves(filtered);
        }
      };
    
      return (
        <div className="container mt-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
    
    
    <div className="d-flex justify-content-between">
      <h5 className="mb-4 fw-semibold">All Long Leaves</h5>
    
    {/* <div >
      <select
        className="form-control form-control-sm"
        value={status}
        onChange={(e) => statusFilter(e.target.value)}
      >
        <option value="All">All</option>
        <option value="Approved">Approved</option>
        <option value="Revoked">Revoked</option>
        <option value="Rejected">Rejected</option>
        <option value="">Pending</option>
      </select>
      </div> */}
    </div>
    
    
    
              {/* Filters */}
              {/* <div className="row mb-4">
                <div className="col-md-3">
                  <label className="form-label text-muted small">From</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
    
                <div className="col-md-3">
                  <label className="form-label text-muted small">To</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
    
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-50 btn-sm"
                    onClick={handleFilter}
                  >
                    Filter
                  </button>
    
                  <button
                    className="btn btn-outline-secondary w-50 btn-sm ms-2"
                    onClick={() => {
                      setFromDate(startOfMonth());
                      setToDate(endOfMonth());
                      fetchLeaves();
                    }}
                  >
                    Reset
                  </button>
                </div>
    
                <div className="col-md-2 d-flex align-items-end">
    
                  
                  
                </div>
              </div> */}
    
              <div className="table-responsive">
                <table className="table table-hover align-middle leave-request-table">
                  <thead className="text-muted my-thead text-uppercase">
                    <tr>
                      <th className="fw-light text-muted">Employee</th>
                      <th className="fw-light text-muted">Leave Type</th>
                      <th className="fw-light text-muted">Dates Requested</th>
                      <th className="fw-light text-muted">Duration</th>
                      <th className="fw-light text-muted">Status</th>
                      <th className="fw-light text-muted">Message</th>
                      <th className="fw-light text-muted">Approved By</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    {leaves.length > 0 ? (
                      leaves.map((leave) => (
                        <tr key={leave.ID} onClick={ () => openPopup(leave)}>
                          <td>{leave?.Employee?.Name || "-"}</td>
                          <td>Long Leave</td>
                          <td>
                            <small className="text-muted">
                              {leave?.From} to {leave?.To}
                            </small>
                          </td>
                          <td>{leave?.No_of_Days_Leave}</td>
                          <td>{getStatusBadge(leave?.Approval_Status)}</td>
                          <td className="" style={{width:"20%"}}>{leave?.Reason}</td>
                          <td>{leave?.Approved_by?.Name || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No leave records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    
    
    
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
    
    
      {/* Applied Leave Card */}
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
              <small className="text-muted">Approved by</small>
              <div>{selectedLeave?.Approved_by?.Name || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    
    </section>
    
        </div>
      </div>
    )}
    
    
    
    
    
        </div>
      );


}

export default AllLongLeaves