import { useEffect, useState } from "react";
import { startOfMonth } from "../../utils/dateUtils";
import "../../css/zentable.css";

const SICK = "#ef4444";
const CASUAL = "#6366f1";

const EMP = "Leave_Balance_Form.Employee";

const Dot = ({ color }) => (
  <span className="zen-legend__dot" style={{ background: color }}></span>
);

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const AllEmpLeaveBalance = () => {
  const [leaves, setLeaves] = useState([]);
  const [lopMap, setLopMap] = useState({});
  const [lopLoaded, setLopLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  const filteredLeaves = leaves.filter((leave) => {
    const employeeName = leave?.[EMP]?.Name || "";
    return employeeName.toLowerCase().includes(search.toLowerCase());
  });

  // Returns total LOP of one employee
  async function returnLop(eid) {
    if (!eid) return "0.00";

    const config = {
      report_name: "Leave_History_Report",
      criteria: `Leave_Balance_Form.Employee==${eid}`,
    };

    try {
      const res = await ZOHO.CREATOR.DATA.getRecords(config);

      const totalLOP = (res.data || []).reduce((sum, record) => {
        return sum + Number(record.LOP || 0);
      }, 0);

      return totalLOP.toFixed(2);
    } catch (e) {
      console.error(e);
      return "0.00";
    }
  }

  async function fetchLeaves() {
    const config = {
      report_name: "Leave_History_Report",
      criteria: `Month_field=='${startOfMonth()}'`,
    };

    try {
      const response = await ZOHO.CREATOR.DATA.getRecords(config);

      if (response.code === 3000) {
        const leaveRes = [...response.data].sort((a, b) =>
          a?.[EMP]?.Name?.localeCompare(b?.[EMP]?.Name)
        );

        setLeaves(leaveRes);

        // Fetch LOPs for all employees
        const lopData = {};

        await Promise.all(
          leaveRes.map(async (emp) => {
            const id = emp?.[EMP]?.ID;

            if (id) {
              lopData[id] = await returnLop(id);
            }
          })
        );

        setLopMap(lopData);
        setLopLoaded(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  // TEAM-WIDE ROLL-UP FOR THE FOOTER, OVER WHATEVER THE SEARCH IS SHOWING
  const totals = filteredLeaves.reduce(
    (acc, e) => {
      const casual = Number(e?.Balance_Casual_Leave || 0);
      const sick = Number(e?.Balance_Sick_Leave || 0);
      const lop = Number(lopMap[e?.[EMP]?.ID] || 0);
      return {
        casual: acc.casual + casual,
        sick: acc.sick + sick,
        total: acc.total + casual + sick,
        lop: acc.lop + lop,
      };
    },
    { casual: 0, sick: 0, total: 0, lop: 0 }
  );

  return (
    <div className="mt-3">
      <div className="zen-card">

        <div className="zen-card__head">
          <h5 className="zen-card__title">All Employee Leave Balance</h5>

          {leaves.length > 0 && (
            <span className="count-pill count-pill--violet">
              {filteredLeaves.length}
              {search && ` / ${leaves.length}`}
            </span>
          )}

          <div className="zen-search ms-auto">
            <i className="bi bi-search zen-search__icon"></i>
            <input
              type="text"
              className="zen-input"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="zen-search__clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        <div className="zen-table-scroll">
          <table className="zen-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th className="zen-num zen-div">
                  <span className="zen-sub"><Dot color={CASUAL} /> Casual</span>
                </th>
                <th className="zen-num">
                  <span className="zen-sub"><Dot color={SICK} /> Sick</span>
                </th>
                <th className="zen-num zen-div zen-emphasis">Total</th>
                <th className="zen-num zen-div">LOP YTD</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.map((e, index) => {
                const employeeId = e?.[EMP]?.ID;
                const name = e?.[EMP]?.Name;
                const casualLeave = Number(e?.Balance_Casual_Leave || 0);
                const sickLeave = Number(e?.Balance_Sick_Leave || 0);
                const totalLeave = casualLeave + sickLeave;
                const lop = lopMap[employeeId];

                return (
                  <tr key={employeeId || index}>
                    <td><span className="zen-index">{index + 1}</span></td>

                    <td>
                      <div className="zen-user">
                        <span className="zen-avatar">{getInitials(name)}</span>
                        <span className="zen-user__name">{name || "N/A"}</span>
                      </div>
                    </td>

                    <td className={`zen-num zen-div ${casualLeave === 0 ? "zen-alert" : ""}`}>
                      {casualLeave.toFixed(2)}
                    </td>

                    <td className={`zen-num ${sickLeave === 0 ? "zen-alert" : ""}`}>
                      {sickLeave.toFixed(2)}
                    </td>

                    <td className="zen-num zen-div zen-emphasis">
                      {totalLeave.toFixed(2)}
                    </td>

                    {/* THE OLD CODE PRINTED "0.00" WHILE THE PER-EMPLOYEE LOP
                        CALLS WERE STILL IN FLIGHT, WHICH READS AS REAL DATA */}
                    <td className={`zen-num zen-div ${Number(lop) > 0 ? "zen-alert" : ""}`}>
                      {lopLoaded ? (lop || "0.00") : <span className="zen-muted">—</span>}
                    </td>
                  </tr>
                );
              })}

              {loaded && filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="zen-empty">
                      <i className={`bi ${search ? "bi-search" : "bi-people"} zen-empty__icon`}></i>
                      {search
                        ? `No employee matches "${search}".`
                        : "No leave balances found for this month."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {filteredLeaves.length > 0 && (
              <tfoot>
                <tr>
                  <td></td>
                  <td><span className="zen-total-label">Total</span></td>
                  <td className="zen-num zen-div">{totals.casual.toFixed(2)}</td>
                  <td className="zen-num">{totals.sick.toFixed(2)}</td>
                  <td className="zen-num zen-div zen-emphasis">{totals.total.toFixed(2)}</td>
                  <td className="zen-num zen-div">
                    {lopLoaded ? totals.lop.toFixed(2) : <span className="zen-muted">—</span>}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </div>
    </div>
  );
};

export default AllEmpLeaveBalance;
