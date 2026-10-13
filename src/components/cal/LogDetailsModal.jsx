import { useState, useEffect } from "react";
import "../../css/zenmodal.css";
import "../../css/zentable.css";
import Avatar from "../ui/Avatar";

// Strips the leading "MM-DD-YYYY " off a Logs datetime like
// "10-09-2026 01:00:00 PM", leaving just the time half.
const timeOnly = (value) => {
  if (!value) return "—";
  const parts = String(value).split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : value;
};

// An empty Status on the Logs record means nobody has actioned it yet
const logStatusOf = (log) => log?.Status || "Pending";

const STATUS_CHIP = {
  Pending: "zen-chip--pending",
  Approved: "zen-chip--done",
  Rejected: "zen-chip--rejected",
};

const LogDetailsModal = ({ log, task, loading = false, onClose, onStatusChange }) => {

  // Tracked locally so the chip and buttons react the moment the write lands,
  // without waiting for the calendar to refetch
  const [status, setStatus] = useState(logStatusOf(log));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(logStatusOf(log));
    setSubmitting(false);
    setError("");
  }, [log]);

  if (!log && !loading) return null;

  const employeeName = log?.Employee?.Name || log?.Employee?.zc_display_value || "";

  const taskStatus = task?.Task_Status;

  const isPending = status === "Pending";

  // Approve and Reject are the same write with a different value
  const handleLogAction = (action) => {

    if (!log?.ID || submitting) return;

    setSubmitting(true);
    setError("");

    const config = {
      report_name: "All_Logs",
      id: log.ID,
      payload: {
        data: {
          Status: action,
        },
      },
    };

    ZOHO.CREATOR.DATA.updateRecordById(config)
      .then((response) => {
        if (response.code === 3000) {
          console.log(`Log ${action}:`, response);
          setStatus(action);
          onStatusChange?.(log.ID, action);
        } else {
          console.log("Log update error:", response);
          setError("Could not update this log. Please try again.");
        }
      })
      .catch((e) => {
        console.log(e);
        setError("Could not update this log. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="zen-modal-overlay" onClick={onClose}>
      <div className="zen-modal" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>

        <div className="zen-modal__head">
          <span className="zen-modal__icon">
            <i className="bi bi-journal-text"></i>
          </span>

          <div>
            <h5 className="zen-modal__title">Log Details</h5>
            <p className="zen-modal__subtitle">{log?.Date_field || "Work log"}</p>
          </div>

          <button className="zen-modal__close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="zen-modal__body">

          {loading && (
            <p className="text-muted small mb-0">Loading log…</p>
          )}

          {!loading && log && (
            <>
              {/* WHAT THE WORK WAS AGAINST */}
              <div className="zen-log-task">
                <div className="zen-log-task__name">{task?.Task_Name || "—"}</div>

                <div className="zen-log-task__meta">
                  <span className={`zen-chip ${STATUS_CHIP[status] || ""}`}>
                    {status === "Approved" && <i className="bi bi-check2"></i>}
                    {status === "Rejected" && <i className="bi bi-x-lg"></i>}
                    {status === "Pending" && <i className="bi bi-hourglass-split"></i>}
                    {status}
                  </span>

                  {task?.Project_Name?.Project_Name && (
                    <span className="zen-chip zen-chip--zen">
                      <i className="bi bi-folder2"></i>
                      {task.Project_Name.Project_Name}
                    </span>
                  )}

                  {taskStatus && (
                    <span className="zen-chip">{taskStatus}</span>
                  )}
                </div>
              </div>

              {/* THE HOURS, THE WINDOW, AND WHO LOGGED THEM */}
              <div className="zen-log-hero">
                <div>
                  <div className="zen-def__label">Hours Worked</div>
                  <div className="zen-log-hero__value">{log?.Hours_Worked || "—"}</div>
                  <div className="zen-log-hero__range">
                    {timeOnly(log?.Started)} &rarr; {timeOnly(log?.Ended)}
                  </div>
                </div>

                {employeeName && (
                  <span className="zen-log-hero__who">
                    <Avatar name={employeeName} size={26} />
                    {employeeName}
                  </span>
                )}
              </div>

              {/* THE REST OF THE RECORD */}
              <div className="zen-section mt-3">
                <div className="zen-section__title">
                  <i className="bi bi-list-ul"></i> Log Record
                </div>

                <div className="zen-panel">
                  <div className="zen-defs">
                    <div>
                      <div className="zen-def__label">Date</div>
                      <div className="zen-def__value">{log?.Date_field || "—"}</div>
                    </div>
                    <div>
                      <div className="zen-def__label">Log Hours</div>
                      <div className="zen-def__value">{log?.Log_Hours || "—"}</div>
                    </div>
                    <div>
                      <div className="zen-def__label">Status</div>
                      <div className="zen-def__value">{status}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="zen-section">
                <div className="zen-section__title">
                  <i className="bi bi-chat-left-text"></i> Description
                </div>

                <div className="zen-panel">
                  <div className={`zen-log-note ${log?.Description ? "" : "zen-log-note--empty"}`}>
                    {log?.Description || "No description added for this log."}
                  </div>
                </div>
              </div>

              {error && <span className="zen-error">{error}</span>}
            </>
          )}

          {!loading && !log && (
            <p className="text-muted small mb-0">This log could not be found on the task.</p>
          )}

        </div>

        {!loading && log && (
          <div className="zen-modal__foot">
            {!isPending && (
              <span className="me-auto small text-muted">
                Already {status.toLowerCase()}.
              </span>
            )}

            <button
              className={`action-btn btn-green ${!isPending || submitting ? 'opacity-50' : ''}`}
              onClick={() => handleLogAction("Approved")}
              disabled={!isPending || submitting}
            >
              <i className="bi bi-check2 me-1"></i> Approve
            </button>

            <button
              className={`action-btn btn-red ${!isPending || submitting ? 'opacity-50' : ''}`}
              onClick={() => handleLogAction("Rejected")}
              disabled={!isPending || submitting}
            >
              <i className="bi bi-x-lg me-1"></i> Reject
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LogDetailsModal;
