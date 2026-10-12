import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext'
import '../../css/leave.css'
import '../../css/zentable.css'
import { startOfMonth } from '../../utils/dateUtils'

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Month_field ARRIVES AS "09-01-2026" — "Sep 2026" IS FAR EASIER TO SCAN
const formatMonth = (value = "") => {
  const [month, , year] = value.split("-");
  const label = MONTHS[Number(month) - 1];
  return label ? `${label} ${year}` : value;
};

// STRING COMPARISON AGAINST "0.00" BROKE THE MOMENT ZOHO RETURNED "0" OR 0
const isEmpty = (value) => parseFloat(value) === 0;
const isPositive = (value) => parseFloat(value) > 0;

// TIES THE SICK / CASUAL SUB-COLUMNS TO THE COLOURS USED ON THE BALANCE CARDS
const SICK = "#ef4444";
const CASUAL = "#6366f1";

const Dot = ({ color }) => (
  <span className="zen-legend__dot" style={{ background: color }}></span>
);

const LeaveHistory = () => {

    const [history, setHistory] = useState([])
    const [loaded, setLoaded] = useState(false)
    const {USERID} = useUser()

    // THE FETCH READS USERID, SO IT HAS TO RE-RUN WHEN USERID ARRIVES —
    // WITH AN EMPTY DEP ARRAY IT FIRED ONCE WITH AN EMPTY ID
    useEffect(()=>{

        if(!USERID) return

        fetchLeaveHistory()

    },[USERID])

    function fetchLeaveHistory(){
        const config = {
                report_name: "All_Leave_Balances",
                criteria: `Employee.ID==${USERID}`
        }

        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {

            if(response.code === 3000){
                console.log("Leave History:", response.data)
                setHistory(response.data[0]?.Leave_History || [])

            }

        }).catch((err) => console.error(err))
          .finally(() => setLoaded(true))
    }

    const currentMonth = startOfMonth();

  return (
    <div className="mt-3">
      <div className="zen-card">

        <div className="zen-card__head">
          <h5 className="zen-card__title">Credit History</h5>

          {history.length > 0 && (
            <span className="count-pill count-pill--violet">{history.length} months</span>
          )}

          <div className="zen-legend ms-auto mt-0">
            <span className="zen-legend__item">
              <Dot color={SICK} /> Sick
            </span>
            <span className="zen-legend__item">
              <Dot color={CASUAL} /> Casual
            </span>
          </div>
        </div>

        <div className="zen-table-scroll">
          <table className="zen-table">
            <thead>
              {/* GROUPING TIER — TURNS NINE LOOSE COLUMNS INTO THREE PAIRS + LOP */}
              <tr className="zen-group">
                <th></th>
                <th></th>
                <th colSpan="2">Eligible</th>
                <th colSpan="2">Used</th>
                <th colSpan="2">Balance</th>
                <th></th>
              </tr>

              <tr>
                <th>#</th>
                <th>Month</th>

                <th className="zen-num zen-div"><span className="zen-sub"><Dot color={SICK} /> Sick</span></th>
                <th className="zen-num"><span className="zen-sub"><Dot color={CASUAL} /> Casual</span></th>

                <th className="zen-num zen-div"><span className="zen-sub"><Dot color={SICK} /> Sick</span></th>
                <th className="zen-num"><span className="zen-sub"><Dot color={CASUAL} /> Casual</span></th>

                <th className="zen-num zen-div"><span className="zen-sub"><Dot color={SICK} /> Sick</span></th>
                <th className="zen-num"><span className="zen-sub"><Dot color={CASUAL} /> Casual</span></th>

                <th className="zen-num zen-div">LOP</th>
              </tr>
            </thead>

            <tbody>
              {history.map((e, index) => {

                const isCurrent = e.Month_field === currentMonth;

                return (
                  <tr key={e.ID || index} className={isCurrent ? "is-current" : ""}>
                    <td><span className="zen-index">{index + 1}</span></td>

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

                    <td className={`zen-num zen-div ${isEmpty(e.Balance_Sick_Leave) ? "zen-alert" : ""}`}>
                      {e.Balance_Sick_Leave}
                    </td>
                    <td className={`zen-num ${isEmpty(e.Balance_Casual_Leave) ? "zen-alert" : ""}`}>
                      {e.Balance_Casual_Leave}
                    </td>

                    <td className={`zen-num zen-div ${isPositive(e.LOP) ? "zen-alert" : ""}`}>
                      {e.LOP}
                    </td>
                  </tr>
                );
              })}

              {loaded && history.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="zen-empty">
                      <i className="bi bi-clock-history zen-empty__icon"></i>
                      No credit history available yet.
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

export default LeaveHistory
