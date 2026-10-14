import { useState, useEffect, useRef, useMemo } from "react";
import "../../css/logmodal.css";
import Avatar from "../ui/Avatar";
import { useUser } from "../../context/UserContext";

// "10-09-2026 01:00:00 PM" or "01:00:00 PM" -> minutes past midnight
const toMinutes = (value) => {
  if (!value) return null;

  const parts = String(value).trim().split(/\s+/);
  const last = parts[parts.length - 1];
  const hasMeridian = /^(AM|PM)$/i.test(last);
  const clock = hasMeridian ? parts[parts.length - 2] : last;
  if (!clock) return null;

  const [h, m] = clock.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  let hour = h;
  if (hasMeridian && last.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (hasMeridian && last.toUpperCase() === "AM" && hour === 12) hour = 0;

  return hour * 60 + m;
};

const fmtClock = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
};

// Terse ruler labels, the way a timesheet writes them: 9a, 12p, 5p
const fmtHour = (h) => {
  const hour = h % 24;
  const suffix = hour >= 12 ? "p" : "a";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// MM-DD-YYYY -> "Thu 09 Oct 2026"
const fmtDate = (value) => {
  if (!value) return "";
  const [month, day, year] = String(value).split("-").map(Number);
  if (!month || !day || !year) return value;

  const date = new Date(year, month - 1, day);
  return `${DAYS[date.getDay()]} ${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
};

// An empty Status on the Logs record means nobody has actioned it yet
const logStatusOf = (log) => log?.Status || "Pending";

const LogDetailsModal = ({ log, task, loading = false, onClose, onStatusChange }) => {

  const { USERID } = useUser();

  // Tracked locally so the panel reacts the moment the write lands, without
  // waiting for the calendar to refetch
  const [status, setStatus] = useState(logStatusOf(log));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Rejecting takes a reason, so the button opens a composer rather than writing
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const panelRef = useRef(null);
  const reasonRef = useRef(null);
  const rejectingRef = useRef(false);

  useEffect(() => { rejectingRef.current = rejecting; }, [rejecting]);

  const closeComposer = () => {
    setRejecting(false);
    setError("");
  };

  useEffect(() => {
    setStatus(logStatusOf(log));
    setSubmitting(false);
    setError("");
    setRejecting(false);
    setReason(log?.Rejection_Message || "");
  }, [log]);

  useEffect(() => {
    if (rejecting) reasonRef.current?.focus();
  }, [rejecting]);

  useEffect(() => {
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (rejectingRef.current) closeComposer();
      else onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The working day as a track, the log as the stretch it occupied. The window
  // is a normal 8am-7pm day, widened only if this log falls outside it.
  const span = useMemo(() => {
    const start = toMinutes(log?.Started);
    const end = toMinutes(log?.Ended);
    if (start === null || end === null || end <= start) return null;

    const fromHour = Math.min(8, Math.floor((start - 60) / 60));
    const toHour = Math.max(19, Math.ceil((end + 60) / 60));
    const from = fromHour * 60;
    const total = toHour * 60 - from;

    const hours = [];
    for (let h = fromHour; h <= toHour; h++) {
      hours.push({ hour: h, at: ((h * 60 - from) / total) * 100, labelled: (h - fromHour) % 2 === 0 });
    }

    const left = ((start - from) / total) * 100;
    const width = ((end - start) / total) * 100;

    return {
      hours,
      left,
      width,
      centre: Math.min(88, Math.max(12, left + width / 2)),
      startLabel: fmtClock(start),
      endLabel: fmtClock(end),
    };
  }, [log]);

  if (!log && !loading) return null;

  const employeeName = log?.Employee?.Name || log?.Employee?.zc_display_value || "";
  const firstName = employeeName.split(" ")[0] || "the employee";
  const isPending = status === "Pending";

  // Nobody signs off their own time
  const isOwnLog = Boolean(log?.Employee?.ID) && String(log.Employee.ID) === String(USERID);

  // Approve and Reject are the same write with a different value; a rejection
  // also carries the reason the employee will read
  const handleLogAction = (action, message = "") => {

    if (!log?.ID || submitting || isOwnLog) return;

    setSubmitting(true);
    setError("");

    const config = {
      report_name: "All_Logs",
      id: log.ID,
      payload: {
        data: {
          Status: action,
          ...(action === "Rejected" ? { Rejection_Message: message } : {}),
        },
      },
    };

    ZOHO.CREATOR.DATA.updateRecordById(config)
      .then((response) => {
        if (response.code === 3000) {
          console.log(`Log ${action}:`, response);
          setStatus(action);
          setRejecting(false);
          onStatusChange?.(log.ID, action, message);
        } else {
          console.log("Log update error:", response);
          setError("That didn't save. Try again.");
        }
      })
      .catch((e) => {
        console.log(e);
        setError("That didn't save. Try again.");
      })
      .finally(() => setSubmitting(false));
  };

  const submitRejection = () => {
    const message = reason.trim();

    if (!message) {
      setError(`Say what needs fixing. ${firstName} sees this message.`);
      reasonRef.current?.focus();
      return;
    }

    handleLogAction("Rejected", message);
  };

  return (
    <div className="logrev-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logrev-title"
        className={`logrev ${status === "Approved" ? "is-approved" : ""} ${status === "Rejected" ? "is-rejected" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="logrev__head">
          <div>
            <h2 className="logrev__task" id="logrev-title">
              {loading ? "Loading log" : (task?.Task_Name || "Work log")}
            </h2>

            {!loading && (task?.Project_Name?.Project_Name || task?.Task_Status) && (
              <div className="logrev__meta">
                {task?.Project_Name?.Project_Name && <span>{task.Project_Name.Project_Name}</span>}
                {task?.Project_Name?.Project_Name && task?.Task_Status && (
                  <span className="logrev__sep" aria-hidden="true"></span>
                )}
                {task?.Task_Status && <span>{task.Task_Status}</span>}
              </div>
            )}
          </div>

          <button className="logrev__close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="logrev__body">

          {loading && <p className="logrev__loading">Fetching this log…</p>}

          {!loading && !log && (
            <p className="logrev__missing">This log is no longer on the task.</p>
          )}

          {!loading && log && (
            <>
              <div className="logrev__who">
                <Avatar name={employeeName} size={26} />
                <span className="logrev__name">{employeeName || "Unassigned"}</span>
                <time className="logrev__date">{fmtDate(log?.Date_field)}</time>
              </div>

              <div className="logrev__span">
                <div className="logrev__state">
                  {status}
                  {log?.Hours_Worked && <span className="logrev__total">{log.Hours_Worked}</span>}
                </div>

                {span ? (
                  <>
                    <div className="logrev__hours" aria-hidden="true">
                      {span.hours.filter(h => h.labelled).map(h => (
                        <span
                          key={h.hour}
                          className="logrev__hour"
                          style={{
                            left: `${h.at}%`,
                            transform: h.at === 0 ? "none" : h.at === 100 ? "translateX(-100%)" : "translateX(-50%)",
                          }}
                        >
                          {fmtHour(h.hour)}
                        </span>
                      ))}
                    </div>

                    <div
                      className="logrev__track"
                      role="img"
                      aria-label={`${span.startLabel} to ${span.endLabel}, ${log?.Hours_Worked || ""}`}
                    >
                      {span.hours.map(h => (
                        <span key={h.hour} className="logrev__tick" style={{ left: `${h.at}%` }}></span>
                      ))}

                      <div className="logrev__fill" style={{ left: `${span.left}%`, width: `${span.width}%` }}></div>
                    </div>

                    <div className="logrev__clock">
                      <span style={{ left: `${span.centre}%` }}>
                        {span.startLabel} – {span.endLabel}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="logrev__decimal" style={{ margin: 0 }}>
                    No start and end time on this log.
                  </p>
                )}
              </div>


              <p className={`logrev__note ${log?.Description ? "" : "logrev__note--empty"}`}>
                {log?.Description || `${firstName} didn't add a description.`}
              </p>
            </>
          )}

        </div>

        {!loading && log && (
          <div className={`logrev__foot ${rejecting ? "is-composing" : ""}`}>

            {!isPending && (
              <div>
                <p className="logrev__resolved">
                  {status === "Approved"
                    ? (isOwnLog
                        ? "Approved. This log is locked."
                        : `Locked, and visible to ${firstName} in their task log.`)
                    : (isOwnLog
                        ? "Sent back to you."
                        : `Sent back. Visible to ${firstName} in their task log.`)}
                </p>

                {status === "Rejected" && (log?.Rejection_Message || reason) && (
                  <p className="logrev__said">{log?.Rejection_Message || reason}</p>
                )}
              </div>
            )}

            {isPending && isOwnLog && (
              <p className="logrev__resolved">
                You logged this one. It needs another manager's decision.
              </p>
            )}

            {isPending && !isOwnLog && !rejecting && (
              <>
                {error && <p className="logrev__error">{error}</p>}

                <button
                  className="logrev__btn logrev__btn--reject"
                  onClick={() => setRejecting(true)}
                  disabled={submitting}
                >
                  Reject
                </button>
                <button
                  className="logrev__btn logrev__btn--approve"
                  onClick={() => handleLogAction("Approved")}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Approve"}
                </button>
              </>
            )}

            {isPending && !isOwnLog && rejecting && (
              <>
                <textarea
                  id="logrev-reason"
                  ref={reasonRef}
                  className={`logrev__reason ${error ? "is-missing" : ""}`}
                  rows={3}
                  value={reason}
                  placeholder={`What needs fixing? ${firstName} reads this.`}
                  aria-label="Reason for rejecting this log"
                  onChange={(e) => { setReason(e.target.value); if (error) setError(""); }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitRejection();
                  }}
                />

                {error && <p className="logrev__error">{error}</p>}

                <div className="logrev__actions">
                  <button
                    className="logrev__btn logrev__btn--ghost"
                    onClick={closeComposer}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="logrev__btn logrev__btn--danger"
                    onClick={submitRejection}
                    disabled={submitting}
                  >
                    {submitting ? "Sending…" : "Reject log"}
                  </button>
                </div>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default LogDetailsModal;
