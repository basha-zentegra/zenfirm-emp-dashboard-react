import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { inputToMMDDYYYY,MMDDYYYY_TO_YYYYMMDD, startOfMonth, endOfMonth, getDayName } from "../../utils/dateUtils";
import { getStatusBadge } from '../../utils/uiUtils';
import '../../css/zentable.css';

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Revoked", "Cancelled"];

const LONG_LEAVE_STYLE = { icon: "bi-airplane-fill", color: "#8b5cf6", bg: "#f2ebff" };

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const AllLongLeaves = () => {


    const { USERID } = useUser();

      const [allLeaves, setAllLeaves] = useState([]);
      const [leaves, setLeaves] = useState([]);
      // <input type="date"> ONLY ACCEPTS YYYY-MM-DD, BUT startOfMonth/endOfMonth
      // RETURN MM-DD-YYYY — UNCONVERTED, BOTH PICKERS RENDER BLANK
      const [fromDate, setFromDate] = useState(MMDDYYYY_TO_YYYYMMDD(startOfMonth()));
      const [toDate, setToDate] = useState(MMDDYYYY_TO_YYYYMMDD(endOfMonth()));
      const [status, setStatus] = useState("All");

      const [selectedLeave, setSelectedLeave] = useState(null);
      const [isPopupOpen, setIsPopupOpen] = useState(false);

      const fetchLeaves = async (from, to) => {

        let config = {report_name: "Long_Leave_Report" };

        if (from && to) {
          config.criteria = `From >= "${from}" && From <= "${to}"`;
        }

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
          // THIS REPORT SPELLS IT Approval_Status (CAPITAL S). READING
          // Approval_status MADE EVERY FILTER EXCEPT "All" RETURN NOTHING
          const filtered = allLeaves.filter(
            (leave) => leave.Approval_Status === value
          );

          setLeaves(filtered);
        }
      };

      return (
        <div className="mt-3">
          <div className="zen-card">

            <div className="zen-card__head">
              <h5 className="zen-card__title">All Planned Leaves</h5>

              {leaves.length > 0 && (
                <span className="count-pill count-pill--violet">{leaves.length}</span>
              )}

              <div className="status-filter ms-auto">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`status-chip ${option.toLowerCase()} ${status === option ? "active" : ""}`}
                    onClick={() => statusFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* DATE RANGE */}
            <div className="zen-toolbar">
              <div className="zen-field">
                <label className="zen-field__label" htmlFor="all-long-from">From</label>
                <input
                  id="all-long-from"
                  type="date"
                  className="zen-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="zen-field">
                <label className="zen-field__label" htmlFor="all-long-to">To</label>
                <input
                  id="all-long-to"
                  type="date"
                  className="zen-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div className="zen-toolbar__actions">
                <button className="zen-btn" onClick={handleFilter}>
                  <i className="bi bi-funnel me-1"></i> Filter
                </button>

                <button
                  className="zen-btn zen-btn--ghost"
                  onClick={() => {
                    setFromDate(MMDDYYYY_TO_YYYYMMDD(startOfMonth()));
                    setToDate(MMDDYYYY_TO_YYYYMMDD(endOfMonth()));
                    fetchLeaves();
                  }}
                >
                  Reset
                </button>
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
                    <th>Message</th>
                    <th>Approved By</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map((leave) => (
                      <tr
                        key={leave.ID}
                        className="is-clickable"
                        onClick={() => openPopup(leave)}
                      >
                        <td>
                          <div className="zen-user">
                            <span className="zen-avatar">
                              {getInitials(leave?.Employee?.Name)}
                            </span>
                            <span className="zen-user__name">
                              {leave?.Employee?.Name || "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className="zen-type"
                            style={{ background: LONG_LEAVE_STYLE.bg, color: LONG_LEAVE_STYLE.color }}
                          >
                            <i className={`bi ${LONG_LEAVE_STYLE.icon}`}></i>
                            Long Leave
                          </span>
                        </td>

                        <td>
                          <span className="zen-dates">
                            {leave?.From}
                            <i className="bi bi-arrow-right zen-dates__arrow"></i>
                            {leave?.To}
                          </span>
                        </td>

                        <td>
                          <span className="zen-duration">
                            {leave?.No_of_Days_Leave}<small>days</small>
                          </span>
                        </td>

                        <td>{getStatusBadge(leave?.Approval_Status)}</td>

                        <td>
                          <span className="zen-msg">
                            {leave?.Reason || <span className="zen-muted">—</span>}
                          </span>
                        </td>

                        <td>
                          {leave?.Approved_by?.Name || <span className="zen-muted">—</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="zen-empty">
                          <i className="bi bi-airplane zen-empty__icon"></i>
                          No planned leaves between{" "}
                          <strong>{inputToMMDDYYYY(fromDate)}</strong> and{" "}
                          <strong>{inputToMMDDYYYY(toDate)}</strong>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
