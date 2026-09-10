import { useEffect, useState } from "react";
import { startOfMonth } from "../../utils/dateUtils";

const AllEmpLeaveBalance = () => {
  const [leaves, setLeaves] = useState([]);
  const [lopMap, setLopMap] = useState({});
  const [search, setSearch] = useState("");

  const filteredLeaves = leaves.filter((leave) => {
    const employeeName =
      leave?.["Leave_Balance_Form.Employee"]?.Name || "";
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
          a?.["Leave_Balance_Form.Employee"]?.Name?.localeCompare(
            b?.["Leave_Balance_Form.Employee"]?.Name
          )
        );

        setLeaves(leaveRes);

        // Fetch LOPs for all employees
        const lopData = {};

        await Promise.all(
          leaveRes.map(async (emp) => {
            const id = emp?.["Leave_Balance_Form.Employee"]?.ID;

            if (id) {
              lopData[id] = await returnLop(id);
            }
          })
        );

        setLopMap(lopData);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div>
      <div className="container mt-3">
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-9">
                <h5 className="mb-4 fw-semibold">
                  All Employee Leave Balance
                </h5>
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle leave-request-table">
                <thead className="text-muted my-thead text-uppercase">
                  <tr>
                    <th className="text-muted fw-normal">#</th>
                    <th className="text-muted fw-normal">Employee Name</th>
                    <th className="text-muted fw-normal">Casual Leave</th>
                    <th className="text-muted fw-normal">Sick Leave</th>
                    <th className="text-muted fw-normal bg-primary-subtle">Total Leave</th>
                    <th className="text-muted fw-normal">LOP YTD</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((e, index) => {
                    const employeeId = e?.["Leave_Balance_Form.Employee"]?.ID;
                    const casualLeave = Number(e?.Balance_Casual_Leave || 0);
                    const sickLeave = Number(e?.Balance_Sick_Leave || 0);
                    const totalLeave = casualLeave + sickLeave;


                    return (
                      <tr key={employeeId || index}>
                        <td>{index + 1}</td>

                        <td className="fw-semibold">
                          {e?.["Leave_Balance_Form.Employee"]?.Name || "N/A"}
                        </td>

                        <td>
                          <span className="badge text-dark px-3 py-2">
                            {e?.Balance_Casual_Leave || "-"}
                          </span>
                        </td>

                        <td>
                          <span className="badge text-dark px-3 py-2">
                            {e?.Balance_Sick_Leave || "-"}
                          </span>
                        </td>

                        <td className="bg-primary-subtle">
                          <span className="badge text-dark px-3 py-2 bg-primary-subtle">
                            {totalLeave.toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <span className="badge text-dark px-3 py-2">
                            {lopMap[employeeId] || "0.00"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEmpLeaveBalance;