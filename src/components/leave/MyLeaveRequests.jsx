import {useState, useEffect} from 'react'
import { useUser } from '../../context/UserContext';
import { isFutureDate } from '../../utils/dateUtils';
import { formattedDate } from '../../config';
import { getStatusBadge } from '../../utils/uiUtils';
import '../../css/zentable.css';

// CHIP COLOURS MIRROR THE BALANCE CARDS SO A TYPE READS THE SAME EVERYWHERE
const TYPE_STYLES = {
  "Long Leave":   { icon: "bi-airplane-fill",    color: "#8b5cf6", bg: "#f2ebff" },
  "Sick Leave":   { icon: "bi-thermometer-half", color: "#ef4444", bg: "#fdecec" },
  "Casual Leave": { icon: "bi-umbrella",         color: "#6366f1", bg: "#eceefc" },
};

const FALLBACK_STYLE = { icon: "bi-calendar2-event", color: "#64748b", bg: "#f1f2f6" };

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const MyLeaveRequests = () => {

    const {USERID} = useUser();

    const [leaves, setLeaves] = useState([]);
    const [longLeaves, setLongLeaves] = useState([]);
    const [loaded, setLoaded] = useState(false);

  // BOTH FETCHES KEY OFF USERID — WITH AN EMPTY DEP ARRAY THEY FIRED ONCE
  // WITH WHATEVER USERID HELD ON FIRST RENDER, OFTEN "undefined"
  useEffect(() => {
    if (!USERID) return;

    const fetchLeaves = async () => {
      try {
        const res = await ZOHO.CREATOR.DATA.getRecords({
          report_name: "My_Leaves",
          criteria: `Employee_Name.ID ==${USERID}`
        })

        console.log(res)

        if(res.code == 3000){
            setLeaves(res.data);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    };

    fetchLeaves();
  }, [USERID]);

    useEffect(() => {
    if (!USERID) return;

    const fetchLongLeaves = async () => {
      try {
        const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Long_Leave_Report", criteria: `Employee.ID ==${USERID} && Approval_Status != "Converted" && From > '${formattedDate}'`})

        console.log("Long Leave",res)

        if(res.code == 3000){
            setLongLeaves(res.data);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchLongLeaves();
  }, [USERID]);

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
              setLeaves((prev) => prev.map((leave) => leave.ID === id ? { ...leave, Approval_status: action} : leave));
          }
        }).catch(e => console.warn(e))


  };

  // THE TWO REPORTS USE DIFFERENT FIELD NAMES FOR THE SAME IDEAS —
  // FLATTENING THEM HERE KEEPS ONE SET OF ROW MARKUP INSTEAD OF TWO
  const rows = [
    ...longLeaves.map((l) => ({
      id: l.ID,
      actionable: false,
      employee: l?.Employee?.Name,
      type: "Long Leave",
      from: l?.From,
      to: l?.To,
      days: l?.No_of_Days_Leave,
      status: l?.Approval_Status,
      message: l?.Reason,
      approvedBy: l?.Approved_by?.Name,
    })),
    ...leaves.map((l) => ({
      id: l.ID,
      actionable: true,
      employee: l?.Employee_Name?.Name,
      type: l?.Leave_Type1,
      from: l?.From,
      to: l?.To,
      days: l?.No_Of_Days_Leave,
      status: l?.Approval_status,
      message: l?.Comments,
      approvedBy: l?.Approved_by?.Name,
    })),
  ];

  return (
    <div className="mt-3">
      <div className="zen-card">

        <div className="zen-card__head">
          <h5 className="zen-card__title">My Requests</h5>
          {rows.length > 0 && (
            <span className="count-pill count-pill--violet">{rows.length}</span>
          )}
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
                <th>Message</th>
                <th>Approved by</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {

                const style = TYPE_STYLES[row.type] || FALLBACK_STYLE;

                // WAS "Approved || Pending && isFutureDate", which && binding
                // turned into "Approved || (Pending && future)" — so a long-past
                // approved leave still offered a Revoke menu
                const canAct =
                  row.actionable &&
                  (row.status === "Approved" || row.status === "Pending") &&
                  isFutureDate(row.from);

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

                    <td>
                      <span className="zen-msg">
                        {row.message || <span className="zen-muted">—</span>}
                      </span>
                    </td>

                    <td>{row.approvedBy || <span className="zen-muted">—</span>}</td>

                    <td className="text-end">
                      {canAct && (
                        <div className="dropdown">
                          <button
                            className="zen-kebab"
                            data-bs-toggle="dropdown"
                            aria-label="Row actions"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>

                          <ul className="dropdown-menu dropdown-menu-end zen-menu">
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleAction(row.id, "Revoked")}
                                style={{opacity: row.status !== "Approved" ? '0.5' : '1'}}
                                disabled={row.status !== "Approved"}
                              >
                                <i className="bi bi-backspace-reverse"></i> Revoke
                              </button>
                            </li>

                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleAction(row.id, "Cancelled")}
                                style={{opacity: row.status !== "Pending" ? '0.5' : '1'}}
                                disabled={row.status !== "Pending"}
                              >
                                <i className="bi bi-ban"></i> Cancel
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {loaded && rows.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="zen-empty">
                      <i className="bi bi-calendar2-check zen-empty__icon"></i>
                      No leave requests yet.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default MyLeaveRequests
