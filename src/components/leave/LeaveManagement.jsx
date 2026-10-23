import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { startOfMonth,getDayName } from "../../utils/dateUtils";
import { getStatusBadge } from '../../utils/uiUtils';
import '../../css/zentable.css';
import '../../css/zenmodal.css';


const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Revoked", "Cancelled"];

const TYPE_STYLES = {
  "Long Leave":   { icon: "bi-airplane-fill",    color: "#8b5cf6", bg: "#f2ebff" },
  "Sick Leave":   { icon: "bi-thermometer-half", color: "#ef4444", bg: "#fdecec" },
  "Casual Leave": { icon: "bi-umbrella",         color: "#6366f1", bg: "#eceefc" },
};

const FALLBACK_STYLE = { icon: "bi-calendar2-event", color: "#64748b", bg: "#f1f2f6" };

const LONG_LEAVE_STYLE = TYPE_STYLES["Long Leave"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Month_field ARRIVES AS "09-01-2026"; ONLY THE MONTH MATTERS
const formatMonth = (value = "") => {
  const [month, , year] = value.split("-");
  const label = MONTHS[Number(month) - 1];
  return label ? `${label} ${year}` : value;
};

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

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
            // setLeaves(res.data);
            // console.log("res",res)
            const sortedLeaves = [...res.data].sort((a, b) => {
              if (a.Approval_status === "Pending") return -1;
              if (b.Approval_status === "Pending") return 1;
              return 0;
            });

            setLeaves(sortedLeaves);
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
            const sortedLeaves = [...res.data].sort((a, b) => {
              if (a.Approval_Status === "Pending") return -1;
              if (b.Approval_Status === "Pending") return 1;
              return 0;
            });
              setLongLeaves(sortedLeaves);
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

// ESC CLOSES WHICHEVER REVIEW IS OPEN — THE OVERLAY CLICK WAS THE ONLY WAY OUT
useEffect(() => {
  if (!isPopupOpen && !longLeavePopUp) return;

  const onKey = (e) => { if (e.key === "Escape") closePopup(); };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [isPopupOpen, longLeavePopUp]);

// WHICH QUEUE IS ON SCREEN — ordinary leave is the common case, so it leads
const [view, setView] = useState("leave"); // "leave" | "long"

const [activeFilters, setActiveFilters] = useState([]); // empty = "All"

const toggleFilter = (status) => {
  if (status === "All") {
    setActiveFilters([]); // reset to All
    return;
  }
  setActiveFilters((prev) =>
    prev.includes(status)
      ? prev.filter((s) => s !== status) // clicking again removes it
      : [...prev, status]                // add to selection
  );
};

const isActive = (status) =>
  status === "All" ? activeFilters.length === 0 : activeFilters.includes(status);

const matchesFilter = (status) =>
  activeFilters.length === 0 || activeFilters.includes(status);

// note the different field names in your two datasets
const filteredLongLeaves = longLeaves.filter((l) => matchesFilter(l?.Approval_Status));
const filteredLeaves = leaves.filter((l) => matchesFilter(l?.Approval_status));

  // THE TWO REPORTS NAME THE SAME IDEAS DIFFERENTLY (Approval_Status vs
  // Approval_status, No_of_Days_Leave vs No_Of_Days_Leave) — FLATTEN ONCE
  // SO THERE IS A SINGLE SET OF ROW MARKUP
  const longRows = filteredLongLeaves.map((l) => ({
    id: l.ID,
    employee: l?.Employee?.Name,
    type: "Long Leave",
    from: l?.From,
    to: l?.To,
    days: l?.No_of_Days_Leave,
    status: l?.Approval_Status,
    onOpen: () => openLongLeavePopup(l),
  }));

  const leaveRows = filteredLeaves.map((l) => ({
    id: l.ID,
    employee: l?.Employee_Name?.Name,
    type: l?.Leave_Type1,
    from: l?.From,
    to: l?.To,
    days: l?.No_Of_Days_Leave,
    status: l?.Approval_status,
    onOpen: () => openPopup(l),
  }));

  // Waiting work first. The rank keeps the comparator antisymmetric — returning
  // -1 whenever `a` is pending gave an inconsistent order when both were.
  const rows = [...(view === "long" ? longRows : leaveRows)].sort(
    (a, b) => (a.status === "Pending" ? 0 : 1) - (b.status === "Pending" ? 0 : 1)
  );

  // Counted off the full lists, not the filtered rows, so switching the status
  // filter never changes what is actually waiting
  const pendingLeave = leaves.filter((l) => l?.Approval_status === "Pending").length;
  const pendingLong = longLeaves.filter((l) => l?.Approval_Status === "Pending").length;
  const pendingCount = pendingLeave + pendingLong;

  const viewLabel = view === "long" ? "long leave" : "leave";

  return (
    <div className="mt-3">
      <div className="zen-card">

        <div className="zen-card__head">
          <h5 className="zen-card__title">Leave Approvals</h5>

          {/* WHAT A MANAGER OPENS THIS SCREEN FOR — SURFACE IT IN THE HEADER */}
          {pendingCount > 0 && (
            <span className="count-pill count-pill--warning">{pendingCount} pending</span>
          )}

          <div className="zen-switch" role="tablist" aria-label="Leave queue">
            <button
              type="button"
              role="tab"
              aria-selected={view === "leave"}
              className={`zen-switch__opt ${view === "leave" ? "is-on" : ""}`}
              onClick={() => setView("leave")}
            >
              Leave
              {pendingLeave > 0 && <span className="zen-switch__badge">{pendingLeave}</span>}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={view === "long"}
              className={`zen-switch__opt ${view === "long" ? "is-on" : ""}`}
              onClick={() => setView("long")}
            >
              Long Leave
              {pendingLong > 0 && <span className="zen-switch__badge">{pendingLong}</span>}
            </button>
          </div>

          <div className="status-filter ms-auto">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                className={`status-chip ${status.toLowerCase()} ${isActive(status) ? "active" : ""}`}
                onClick={() => toggleFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="zen-table-scroll">
          <table className="zen-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates Requested</th>
                <th>Duration</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {

                const style = TYPE_STYLES[row.type] || FALLBACK_STYLE;

                return (
                  <tr key={`${row.id}-${row.type}`}>
                    <td>
                      <div className="zen-user">
                        <span className="zen-avatar">{getInitials(row.employee)}</span>
                        <span className="zen-user__name">{row.employee || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className="zen-type"
                        style={{ background: style.bg, color: style.color }}
                      >
                        <i className={`bi ${style.icon}`}></i>
                        {row.type || "Leave"}
                      </span> 
                    </td>

                    <td>
                      <span className="zen-dates">
                        {row.from}
                        <i className="bi bi-arrow-right zen-dates__arrow"></i>
                        {row.to}
                      </span>
                    </td>

                    <td>
                      <span className="zen-duration">
                        {row.days}<small>days</small>
                      </span>
                    </td>

                    <td>{getStatusBadge(row.status)}</td>

                    <td className="text-end">
                      <button
                        className="zen-kebab"
                        onClick={row.onOpen}
                        aria-label="Review request"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="zen-empty">
                      <i className="bi bi-inbox zen-empty__icon"></i>
                      {activeFilters.length
                        ? `No ${viewLabel} requests match the selected filter.`
                        : `No ${viewLabel} requests to review.`}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

{longLeavePopUp && selectedLeave && (
  <div className="zen-modal-overlay" onClick={closePopup}>
    <div className="zen-modal" onClick={(e) => e.stopPropagation()}>

      <div className="zen-modal__head">
        <span
          className="zen-type"
          style={{ background: LONG_LEAVE_STYLE.bg, color: LONG_LEAVE_STYLE.color }}
        >
          <i className={`bi ${LONG_LEAVE_STYLE.icon}`}></i>
          Long Leave
        </span>
        <h5 className="zen-modal__title">Review Request</h5>
        {getStatusBadge(selectedLeave?.Approval_Status)}

        <button className="zen-modal__close" onClick={closePopup} aria-label="Close">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="zen-modal__body">

        <div className="zen-section">
          <div className="zen-section__title">
            <i className="bi bi-person"></i> Applicant
          </div>

          <div className="zen-panel">
            <div className="zen-user mb-3">
              <span className="zen-avatar">{getInitials(selectedLeave?.Employee?.Name)}</span>
              <span className="zen-user__name">{selectedLeave?.Employee?.Name || "—"}</span>
            </div>

            <div className="zen-defs">
              <div>
                <div className="zen-def__label">Duration</div>
                <div className="zen-def__value">
                  <span className="zen-dates">
                    {selectedLeave?.From}
                    <i className="bi bi-arrow-right zen-dates__arrow"></i>
                    {selectedLeave?.To}
                  </span>
                </div>
              </div>

              <div>
                <div className="zen-def__label">Days</div>
                <div className="zen-def__value">{selectedLeave?.No_of_Days_Leave}</div>
              </div>

              <div>
                <div className="zen-def__label">Reason</div>
                <div className="zen-def__value">{selectedLeave?.Reason || "—"}</div>
              </div>

              <div>
                <div className="zen-def__label">Actioned by</div>
                <div className="zen-def__value">{selectedLeave?.Approved_by?.Name || "—"}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="zen-modal__foot">
        {!rejectMode ? (
          <>
            <button
              className="zen-btn zen-btn--success"
              onClick={() => {
                handleAction(selectedLeave.ID, "Approved", true);
                closePopup();
              }}
              disabled={selectedLeave?.Approval_Status !== "Pending"}
            >
              <i className="bi bi-check2 me-1"></i> Approve
            </button>

            <button
              className="zen-btn zen-btn--danger"
              onClick={() => setRejectMode(true)}
              disabled={selectedLeave?.Approval_Status !== "Pending"}
            >
              <i className="bi bi-x-lg me-1"></i> Reject
            </button>
          </>
        ) : (
          <div className="zen-reject">
            <div className="zen-def__label">Reason for rejection</div>

            <textarea
              className="zen-textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Let them know why..."
              autoFocus
            />
            {!rejectReason.trim() && (
              <small className="zen-error">Reason is required</small>
            )}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                className="zen-btn zen-btn--ghost"
                onClick={() => {
                  setRejectMode(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>

              <button
                className="zen-btn zen-btn--danger"
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
          </div>
        )}
      </div>

    </div>
  </div>
)}


{isPopupOpen && selectedLeave && (
  <div className="zen-modal-overlay" onClick={closePopup}>
    <div className="zen-modal" onClick={(e) => e.stopPropagation()}>

      <div className="zen-modal__head">
        {(() => {
          const style = TYPE_STYLES[selectedLeave?.Leave_Type1] || FALLBACK_STYLE;
          return (
            <span className="zen-type" style={{ background: style.bg, color: style.color }}>
              <i className={`bi ${style.icon}`}></i>
              {selectedLeave?.Leave_Type1 || "Leave"}
            </span>
          );
        })()}
        <h5 className="zen-modal__title">Review Request</h5>
        {getStatusBadge(selectedLeave?.Approval_status)}

        <button className="zen-modal__close" onClick={closePopup} aria-label="Close">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="zen-modal__body">

        {/* ── APPLICANT ── */}
        <div className="zen-section">
          <div className="zen-section__title">
            <i className="bi bi-person"></i> Applicant
          </div>

          <div className="zen-panel">
            <div className="zen-user mb-3">
              <span className="zen-avatar">{getInitials(selectedLeave?.Employee_Name?.Name)}</span>
              <span className="zen-user__name">{selectedLeave?.Employee_Name?.Name || "—"}</span>
            </div>

            <div className="zen-defs">
              <div>
                <div className="zen-def__label">Duration</div>
                <div className="zen-def__value">
                  <span className="zen-dates">
                    {selectedLeave?.From}
                    <i className="bi bi-arrow-right zen-dates__arrow"></i>
                    {selectedLeave?.To}
                  </span>
                </div>
              </div>

              <div>
                <div className="zen-def__label">Days</div>
                <div className="zen-def__value">{selectedLeave?.No_Of_Days_Leave}</div>
              </div>

              <div>
                <div className="zen-def__label">Message</div>
                <div className="zen-def__value">{selectedLeave?.Comments || "—"}</div>
              </div>

              <div>
                <div className="zen-def__label">Actioned by</div>
                <div className="zen-def__value">{selectedLeave?.Approved_by?.Name || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DAY BY DAY ── */}
        <div className="zen-section">
          <div className="zen-section__title">
            <i className="bi bi-list-check"></i> Day by day
          </div>

          <div className="zen-table-scroll">
            <table className="zen-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Session</th>
                </tr>
              </thead>
              <tbody>
                {selectedLeave?.Leave_Days_Details?.map((e, i) => (
                  <tr key={e?.ID || i}>
                    <td>
                      <span className="zen-month">
                        {e?.Date_field}
                        <span className="zen-tag zen-tag--day">
                          {getDayName(e?.Date_field)?.slice(0, 3) || "NA"}
                        </span>
                      </span>
                    </td>
                    <td className={e?.Leave_Type?.Leave_Type === "LOP" ? "zen-alert" : ""}>
                      {e?.Leave_Type?.Leave_Type || "—"}
                    </td>
                    <td>{e?.br || "—"}</td>
                  </tr>
                ))}

                {!selectedLeave?.Leave_Days_Details?.length && (
                  <tr>
                    <td colSpan="3">
                      <div className="zen-empty">No day-level breakdown available.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BALANCE HISTORY ── */}
        <div className="zen-section">
          <div className="zen-section__title">
            <i className="bi bi-clock-history"></i> Leave balance history
          </div>

          <div className="zen-table-scroll">
            <table className="zen-table">
              <thead>
                <tr className="zen-group">
                  <th></th>
                  <th colSpan="2">Eligible</th>
                  <th colSpan="2">Used</th>
                  <th colSpan="2">Balance</th>
                  <th></th>
                </tr>
                <tr>
                  <th>Month</th>
                  <th className="zen-num zen-div">Sick</th>
                  <th className="zen-num">Casual</th>
                  <th className="zen-num zen-div">Sick</th>
                  <th className="zen-num">Casual</th>
                  <th className="zen-num zen-div">Sick</th>
                  <th className="zen-num">Casual</th>
                  <th className="zen-num zen-div">LOP</th>
                </tr>
              </thead>

              <tbody>
                {history?.map((e, index) => {

                  const isCurrent = e.Month_field === startOfMonth();

                  return (
                    <tr key={e.ID || index} className={isCurrent ? "is-current" : ""}>
                      <td>
                        <span className="zen-month">
                          {formatMonth(e.Month_field)}
                          {isCurrent && <span className="zen-tag zen-tag--now">Now</span>}
                        </span>
                      </td>

                      <td className="zen-num zen-div">{e.Eligible_Sick_Leave}</td>
                      <td className="zen-num">{e.Eligible_Casual_Leave}</td>

                      <td className="zen-num zen-div">{e.Used_Sick_Leave}</td>
                      <td className="zen-num">{e.Used_Casual_Leave}</td>

                      <td className={`zen-num zen-div ${parseFloat(e.Balance_Sick_Leave) === 0 ? "zen-alert" : ""}`}>
                        {e.Balance_Sick_Leave}
                      </td>
                      <td className={`zen-num ${parseFloat(e.Balance_Casual_Leave) === 0 ? "zen-alert" : ""}`}>
                        {e.Balance_Casual_Leave}
                      </td>

                      <td className={`zen-num zen-div ${parseFloat(e.LOP) > 0 ? "zen-alert" : ""}`}>
                        {e.LOP}
                      </td>
                    </tr>
                  );
                })}

                {!history?.length && (
                  <tr>
                    <td colSpan="8">
                      <div className="zen-empty">No balance history for this employee.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="zen-modal__foot">
        {!rejectMode ? (
          <>
            <button
              className="zen-btn zen-btn--success"
              onClick={() => {
                handleAction(selectedLeave.ID, "Approved");
                closePopup();
              }}
              disabled={selectedLeave?.Approval_status !== "Pending"}
            >
              <i className="bi bi-check2 me-1"></i> Approve
            </button>

            <button
              className="zen-btn zen-btn--danger"
              onClick={() => setRejectMode(true)}
              disabled={selectedLeave?.Approval_status !== "Pending"}
            >
              <i className="bi bi-x-lg me-1"></i> Reject
            </button>
          </>
        ) : (
          <div className="zen-reject">
            <div className="zen-def__label">Reason for rejection</div>

            <textarea
              className="zen-textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Let them know why..."
              autoFocus
            />
            {!rejectReason.trim() && (
              <small className="zen-error">Reason is required</small>
            )}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                className="zen-btn zen-btn--ghost"
                onClick={() => {
                  setRejectMode(false);
                  setRejectReason("");
                }}
              > 
                Cancel
              </button>

              <button
                className="zen-btn zen-btn--danger"
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
          </div>
        )}
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default LeaveManagement;