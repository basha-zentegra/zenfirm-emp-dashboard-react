import { useState, useEffect, useCallback } from "react";
import '../../css/leaveapplayform.css'
import { inputToMMDDYYYY } from "../../utils/dateUtils";

import { useUser } from "../../context/UserContext";

const LEAVE_TYPES = ["Sick", "Casual", "Unpaid"];
const SESSION_OPTIONS = ["Full Day", "First Half", "Second Half"];


const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const todayStr = fmt(today);

function getDatesInRange(from, to) {
  if (!from || !to) return [];
  const dates = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(fmt(new Date(cur)));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function calcDays(rows) {
  return rows.reduce((acc, r) => {
    if (r.session === "Full Day") return acc + 1;
    if (r.session === "First Half" || r.session === "Second Half") return acc + 0.5;
    return acc;
  }, 0);
}

function calcLeaveBalance(rows,LEAVE_BALANCE) {
  const taken = {};
  rows.forEach((r) => {
    if (!r.leaveType) return;
    // const d = r.session === "Full Day" ? 1 : 0.5;
    // const d = r.session === "First Half" || "Second Half" ? 0.5 : 1;
    const d =
      !r.session || r.session === "Full Day"
        ? 1
        : 0.5;

    taken[r.leaveType] = (taken[r.leaveType] || 0) + d;
  });
  const result = {};
  LEAVE_TYPES.forEach((lt) => {
    const avail = LEAVE_BALANCE[lt] || 0;
    const t = taken[lt] || 0;
    result[lt] = { available: avail, taken: t, remaining: avail - t };
  });
  return result;
}

export default function LeaveApplyForm() {

    const {USERID} = useUser();

    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [rows, setRows] = useState([{ date: "", leaveType: "", session: ""}]);
    const [reason, setReason] = useState("");
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);

    const [LEAVE_BALANCE, setLEAVE_BALANCE] = useState({ Sick: 0, Casual: 0, Unpaid: 0 })

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");



    function fetchLeaveHistory(){
        const config = {
            report_name: "All_Leave_Balances",
            criteria: `Employee.ID==${USERID}`
        }
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
            if(response.code === 3000){
                console.log("leave balance...:", response.data)
                // setHistory(response.data[0]?.Leave_History)

                const history = response.data[0]?.Leave_History;

                if(history.length > 0){

                    const lastMonthBalance = history[history.length-1] 

                    console.log(lastMonthBalance)

                    const apiLeaveBalance = { 
                        Sick: parseFloat(lastMonthBalance?.Balance_Sick_Leave) || 0, 
                        Casual: parseFloat(lastMonthBalance?.Balance_Casual_Leave) || 0, 
                        Unpaid: 100
                    }

                    setLEAVE_BALANCE(apiLeaveBalance);
                }

            }
        }).catch((err) => console.error(err))
    }


    useEffect(()=>{
        if(!USERID) return;
        fetchLeaveHistory()
    },[USERID])




  const syncRows = useCallback((from, to, existingRows) => {
    const dates = getDatesInRange(from, to);
    if (dates.length === 0) return [];
    return dates.map((d) => {
      const existing = existingRows.find((r) => r.date === d);
      return existing || { date: d, leaveType: "", session: "" };
    });
  }, []);

  useEffect(() => {
    if (fromDate && toDate && toDate >= fromDate) {
      setRows((prev) => syncRows(fromDate, toDate, prev));
    }
  }, [fromDate, toDate, syncRows]);

  const handleFromDate = (val) => {
    setFromDate(val);
    if (toDate && val > toDate) setToDate(val);
    setErrors((e) => ({ ...e, fromDate: "", toDate: "" }));
  };

  const handleToDate = (val) => {
    setToDate(val);
    setErrors((e) => ({ ...e, toDate: "" }));
  };

  const updateRow = (i, field, val) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
    setErrors((e) => ({ ...e, [`row_${i}_${field}`]: "" }));
  };

  const noOfDays = calcDays(rows);
  const leaveBalance = calcLeaveBalance(rows,LEAVE_BALANCE);

  console.log(leaveBalance)

  const shownTypes = LEAVE_TYPES.filter((lt) => lt !== "Unpaid");
  const usedTypes = [...new Set(rows.filter((r) => r.leaveType).map((r) => r.leaveType))];
  const displayTypes = usedTypes.length > 0 ? usedTypes : ["Sick", "Casual"];

  const validate = () => {
    const errs = {};
    if (!fromDate) errs.fromDate = "From date is required.";
    if (!toDate) errs.toDate = "To date is required.";
    if (fromDate && toDate && toDate < fromDate) errs.toDate = "To date must be ≥ From date.";
    if (!reason.trim()) errs.reason = "Overall reason is required.";

    rows.forEach((r, i) => {
      if (!r.leaveType) errs[`row_${i}_leaveType`] = "Select leave type.";
      if (!r.session) errs[`row_${i}_session`] = "Select session.";
      if (r.leaveType && r.leaveType !== "Unpaid") {
        const bal = leaveBalance[r.leaveType];
        if (bal && bal.remaining < 0) {
          errs[`row_${i}_leaveType`] = `Insufficient ${r.leaveType} leave balance.`;
        }
      }
    });

    Object.keys(leaveBalance).forEach((lt) => {
      if (leaveBalance[lt].remaining < 0) {
        errs[`balance_${lt}`] = `${lt} leave exceeded by ${Math.abs(leaveBalance[lt].remaining)} day(s).`;
      }
    });

    return errs;
  };


const returnLeaveTypeID = (type) => {
    if(type === "Sick"){
        return "266830000005534442"
    } else if(type === "Casual"){
        return "266830000005534446"
    } else{
        return "266830000008579002"
    }
}

const handleSubmit = async () => {
  setSubmitted(true);
  setApiError("");

  const errs = validate();
  setErrors(errs);

  if (Object.keys(errs).length > 0) return;

  setLoading(true);

  try {
    // ✅ Prepare payload (Zoho format)
    const payload = {

        data:{
            Employee_Name: USERID,
            Organization_Name: "",
            From: inputToMMDDYYYY(fromDate),
            To: inputToMMDDYYYY(toDate),
            No_Of_Days_Leave: noOfDays,
            Comments: reason,
            Leave_Days_Details: rows.map((r) => ({
                Date_field: inputToMMDDYYYY(r.date),
                Leave_Type: returnLeaveTypeID(r.leaveType),
                br: r.session,
            })),
            // Casual_Taken : leaveBalance?.Casual?.taken || 0,
            // Sick_Taken : leaveBalance?.Sick?.taken || 0,
            // LOP: leaveBalance?.Unpaid?.taken || 0,
        },
    };

    const config = {
      form_name: "Request_Leave",
      payload: payload
    };

    console.log("Submitting payload:", payload);

    const response = await ZOHO.CREATOR.DATA.addRecords(config);

    console.log(response)
    if (response.code === 3000) {
      setSuccess(true);

      setTimeout(() => handleReset(), 1500);
    } else {
      setApiError("Failed to submit leave. Please try again.");
    }

  } catch (err) {
    console.error(err);
    setApiError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setFromDate(todayStr);
    setToDate(todayStr);
    setRows([{ date: todayStr, leaveType: "", session: ""}]);
    setReason("");
    setErrors({});
    setSubmitted(false);
    setSuccess(false);
  };

  const displayDates = getDatesInRange(fromDate, toDate);
  const rangeError = fromDate && toDate && toDate < fromDate;

  const hasAnyLeave = LEAVE_TYPES.some(
    (lt) => lt !== "Unpaid" && leaveBalance[lt]?.remaining > 0
    );

    const filteredLeaveTypes = hasAnyLeave
    ? LEAVE_TYPES.filter((lt) => lt !== "Unpaid" && leaveBalance[lt]?.remaining > 0)
    : ["Unpaid"];

  return (
    <div className="">

      {success && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a9968" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "0.5rem" }}>Leave Applied!</h4>
            <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Your leave request for <strong>{noOfDays} day(s)</strong> has been submitted successfully.
            </p>
            <button className="btn-primary-custom" onClick={handleReset}>Apply Another Leave</button>
          </div>
        </div>
      )}

      <div className="leave-wrapper">
        <div className="leave-header">
          <div className="breadcrumb-bar">Leave Tracker &rsaquo; <span>Apply Leave</span></div>
          <h1>Apply for Leave</h1>
          <p>Fill in the form below. Weekends are automatically excluded from leave days.</p>
        </div>

        <div className="card-glass">

          {/* ── Date Range + Balance ── */}
          <div className="card-section">
            <div className="section-label">Leave Period</div>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="field-label">From <span className="req">*</span></div>
                    <input
                      type="date"
                      className={`form-control-custom ${errors.fromDate ? "is-error" : ""}`}
                      value={fromDate}
                      min={todayStr}
                      onChange={(e) => handleFromDate(e.target.value)}
                    />
                    {errors.fromDate && <div className="error-msg">⚠ {errors.fromDate}</div>}
                  </div>
                  <div className="col-6">
                    <div className="field-label">To <span className="req">*</span></div>
                    <input
                      type="date"
                      className={`form-control-custom ${errors.toDate ? "is-error" : ""}`}
                      value={toDate}
                      min={fromDate || todayStr}
                      onChange={(e) => handleToDate(e.target.value)}
                    />
                    {errors.toDate && <div className="error-msg">⚠ {errors.toDate}</div>}
                  </div>

                  {rangeError && (
                    <div className="col-12">
                      <div className="alert-custom alert-danger">⚠ To date cannot be before From date.</div>
                    </div>
                  )}

                  {displayDates.length === 0 && !rangeError && fromDate && toDate && (
                    <div className="col-12">
                      <div className="alert-custom" style={{ background: "#fffbf0", borderColor: "var(--warning)", color: "#a07000" }}>
                        ⚠ No working days found in the selected range (weekends excluded).
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="field-label" style={{ marginBottom: "0.75rem" }}>Leave Balance Overview</div>
                <table className="balance-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      {displayTypes.map((t) => <th key={t}>{t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Available</td>
                      {displayTypes.map((t) => (
                        <td key={t}>{leaveBalance[t]?.available ?? 0}</td>
                      ))}
                    </tr>
                    <tr className="row-taken">
                      <td>Leave Taken</td>
                      {displayTypes.map((t) => (
                        <td key={t} style={{ color: leaveBalance[t]?.taken > 0 ? "var(--accent)" : "var(--text-3)" }}>
                          {(leaveBalance[t]?.taken ?? 0).toFixed(1)}
                        </td>
                      ))}
                    </tr>
                    <tr className="row-remaining">
                      <td>Remaining</td>
                      {displayTypes.map((t) => {
                        const rem = leaveBalance[t]?.remaining ?? 0;
                        return (
                          <td key={t} className={rem < 0 ? "negative" : ""}>{rem.toFixed(1)}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
                {Object.keys(errors).filter((k) => k.startsWith("balance_")).map((k) => (
                  <div key={k} className="error-msg mt-1">⚠ {errors[k]}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Leave Days Detail ── */}
          {rows.length > 0 && (
            <div className="card-section">
              <div className="section-label">Leave Days Details <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span></div>
              <div style={{ overflowX: "auto" }}>
                <table className="subform-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th style={{ width: 130 }}>Date</th>
                      <th>Leave Type <span style={{ color: "var(--accent)" }}>*</span></th>
                      <th>Session <span style={{ color: "var(--accent)" }}>*</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const dateObj = new Date(row.date + "T00:00:00");
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                      return (
                        <tr key={row.date} className="subform-row">
                          <td><div className="row-num">{i + 1}</div></td>
                          <td>
                            <div className="date-chip">
                              {inputToMMDDYYYY(row.date)}
                              <span className="day-badge">{dayName}</span>
                            </div>
                          </td>
                          <td>
                            <select
                              className={`form-control-custom ${errors[`row_${i}_leaveType`] ? "is-error" : ""}`}
                              value={row.leaveType}
                              onChange={(e) => updateRow(i, "leaveType", e.target.value)}
                            >
                              <option value="">— Select —</option>

{LEAVE_TYPES.filter((lt) => {
  const remaining = leaveBalance[lt]?.remaining || 0;

  const hasAnyPaidLeave = LEAVE_TYPES.some(
    (type) => type !== "Unpaid" && (leaveBalance[type]?.remaining || 0) > 0
  );

  // ✅ ALWAYS allow currently selected value
  if (row.leaveType === lt) return true;

  // ✅ Case 1: Paid leaves available
  if (hasAnyPaidLeave) {
    if (lt === "Unpaid") return false;
    return remaining > 0;
  }

  // ✅ Case 2: All paid leaves exhausted
  return lt === "Unpaid";
}).map((lt) => (
  <option key={lt} value={lt}>{lt}</option>
))}
                            </select>
                            {errors[`row_${i}_leaveType`] && (
                              <div className="error-msg">⚠ {errors[`row_${i}_leaveType`]}</div>
                            )}
                          </td>
                          <td>
                            <select
                              className={`form-control-custom ${errors[`row_${i}_session`] ? "is-error" : ""}`}
                              value={row.session}
                              onChange={(e) => updateRow(i, "session", e.target.value)}
                            >
                              <option value="">— Select —</option>
                              {SESSION_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {errors[`row_${i}_session`] && (
                              <div className="error-msg">⚠ {errors[`row_${i}_session`]}</div>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Summary & Overall Reason ── */}
          <div className="card-section">
            <div className="section-label">Summary & Reason</div>
            <div className="row g-4 align-items-start">
              <div className="col-md-5">
                <div className="summary-bar">
                  <div className="summary-stat">
                    <span className="label">Working Days</span>
                    <span className="value">{displayDates.length}</span>
                  </div>
                  <div className="divider-v" />
                  <div className="summary-stat">
                    <span className="label">No. of Days Leave</span>
                    <span className="value" style={{ color: noOfDays > 0 ? "var(--accent)" : "var(--primary-dark)" }}>
                      {noOfDays.toFixed(1)}
                    </span>
                  </div>
                  <div className="divider-v" />
                  <div className="summary-stat">
                    <span className="label">Pending Config</span>
                    <span className="value" style={{ fontSize: "0.95rem", color: "var(--text-3)" }}>
                      {rows.filter((r) => !r.leaveType || !r.session).length === 0 && rows.length > 0 ? "✓ Ready" : `${rows.filter((r) => !r.leaveType || !r.session).length} row(s)`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="field-label">Reason for Leave <span className="req">*</span></div>
                <textarea
                  className={`form-control-custom ${errors.reason ? "is-error" : ""}`}
                  rows={3}
                  placeholder="Describe the reason for your leave application..."
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setErrors((er) => ({ ...er, reason: "" })); }}
                  style={{ resize: "vertical", minHeight: 80 }}
                />
                {errors.reason && <div className="error-msg">⚠ {errors.reason}</div>}
                <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "0.3rem" }}>
                  {reason.length} / 500 characters
                </div>
              </div>
            </div>
          </div>

          {/* ── Validation Summary ── */}
          {submitted && Object.keys(errors).filter((k) => !k.startsWith("balance_")).length > 0 && (
            <div className="card-section" style={{ background: "#fff8f8" }}>
              <div className="alert-custom alert-danger">
                <span>⚠</span>
                <div>
                  <strong>Please fix {Object.keys(errors).filter((k) => !k.startsWith("balance_")).length} error(s)</strong> before submitting.
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
{apiError && (
  <div className="alert-custom alert-danger">
    ⚠ {apiError}
  </div>
)}
          <div className="card-section" style={{ background: "var(--surface-2)", display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="btn-secondary-custom" onClick={handleReset}>Reset Form</button>
           <button
                className="btn-primary-custom"
                onClick={handleSubmit}
                disabled={rows.length === 0 || rangeError || loading}
                style={{
                    opacity: rows.length === 0 || rangeError || loading ? 0.5 : 1,
                    cursor: rows.length === 0 || rangeError || loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? "Submitting..." : "Submit Leave Application →"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}