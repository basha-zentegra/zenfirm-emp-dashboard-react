import {useState,useEffect} from "react";
import { useUser } from "../../context/UserContext";
import { startOfMonth } from "../../utils/dateUtils";
import "../../css/leavebalance.css";

const LeaveBalanceCard = ({setError}) => {

      const {USERID} = useUser()
      const [currentData, setCurrentData] = useState({});
  
      useEffect(()=>{

          function fetchLeaveHistory(){

              const config2 = {
                      report_name: "Leave_History_Report",
                      criteria: `Leave_Balance_Form.Employee==${USERID} && Month_field == '${startOfMonth()}'`
              }

              ZOHO.CREATOR.DATA.getRecords(config2).then((response) => {
              
                console.log("Leave History Report: leavebalance card--->", response)
                  if(response.code === 3000){
                      setCurrentData(response.data[0])
                      setError(false)
                      
                  }
              
              }).catch((err) =>{

                console.error(err)
                setError(true)

              } )
          }
  
          fetchLeaveHistory()
  
      },[])



  const data = [
    {
      title: "Casual Leave",
      used: currentData?.Used_Casual_Leave,
      total: currentData?.Eligible_Casual_Leave,
      bal: currentData?.Balance_Casual_Leave,
      icon: "bi-umbrella",
      motion: "lb-icon--sway",
      color: "#6366f1",
      track: "#e9eafd",
      soft: "#eceefc",
    },
    {
      title: "Sick Leave",
      used: currentData?.Used_Sick_Leave,
      total: currentData?.Eligible_Sick_Leave,
      bal: currentData?.Balance_Sick_Leave,
      icon: "bi-thermometer-half",
      motion: "lb-icon--pulse",
      color: "#ef4444",
      track: "#fdeaea",
      soft: "#fdecec",
    },
  ];

  // ZOHO SENDS THESE AS STRINGS ("2.50"), AND ELIGIBLE CAN BE 0 OR MISSING —
  // GUARDING HERE KEEPS THE RING OFF NaN, WHICH WOULD RENDER AS AN EMPTY CIRCLE
  const toNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totals = data.reduce(
    (acc, item) => ({
      used: acc.used + toNum(item.used),
      eligible: acc.eligible + toNum(item.total),
      balance: acc.balance + toNum(item.bal),
    }),
    { used: 0, eligible: 0, balance: 0 }
  );

  return (
    <div className="py-2">
      <div className="row g-4">
        {data.map((item, index) => {

          const used = toNum(item.used);
          const total = toNum(item.total);
          const bal = toNum(item.bal);

          const remainingPct = total > 0
            ? Math.min(100, Math.max(0, (bal / total) * 100))
            : 0;

          return (
            <div className="col-md-6 col-xl-4" key={index}>
              <div className="lb-card">

                <div className="lb-card__body">
                  <div className="lb-card__head">
                    <span
                      className="lb-card__icon"
                      style={{ background: item.soft, color: item.color }}
                    >
                      <i className={`bi ${item.icon} ${item.motion}`}></i>
                    </span>
                    <span className="lb-card__title">{item.title}</span>
                  </div>

                  <div className="lb-card__figures">
                    <span className="lb-card__used">{used.toFixed(2)}</span>
                    <span className="lb-card__total">used of {total.toFixed(2)} days</span>
                  </div>

                  <span
                    className="lb-chip"
                    style={{ background: item.soft, color: item.color }}
                  >
                    {Math.round(remainingPct)}% remaining
                  </span>
                </div>

                {/* PROPORTION OF THE ENTITLEMENT STILL AVAILABLE */}
                <div
                  className="lb-donut"
                  style={{
                    "--lb-target": remainingPct,
                    "--lb-color": item.color,
                    "--lb-track": item.track,
                  }}
                  role="img"
                  aria-label={`${bal} of ${total} ${item.title} days remaining`}
                >
                  <span className="lb-donut__value">
                    <span className="lb-donut__num">{bal.toFixed(2)}</span>
                    <span className="lb-donut__label">days left</span>
                  </span>
                </div>

              </div>
            </div>
          );
        })}

        {/* COMBINED VIEW ACROSS BOTH TYPES — FILLS THE ROW AND ANSWERS
            "HOW MUCH HAVE I GOT ALTOGETHER" WITHOUT A SECOND API CALL */}
        <div className="col-md-12 col-xl-4">
          <div className="lb-card lb-card--total">
            <div className="lb-card__body">

              <div className="lb-card__head">
                <span
                  className="lb-card__icon"
                  style={{ background: "#e8f7ee", color: "#28a05c" }}
                >
                  <i className="bi bi-calendar2-check lb-icon--float"></i>
                </span>
                <span className="lb-card__title">Total Balance</span>
              </div>

              <div className="lb-card__figures">
                <span className="lb-card__used">{totals.balance.toFixed(2)}</span>
                <span className="lb-card__total">
                  days available of {totals.eligible.toFixed(2)}
                </span>
              </div>

              <div className="lb-stack">
                {data.map((item) => {
                  const used = toNum(item.used);
                  const width = totals.eligible > 0 ? (used / totals.eligible) * 100 : 0;
                  if (width <= 0) return null;
                  return (
                    <div
                      key={item.title}
                      className="lb-stack__seg"
                      style={{ width: `${width}%`, background: item.color }}
                      title={`${item.title}: ${used.toFixed(2)} days used`}
                    ></div>
                  );
                })}
              </div>

              <div className="lb-legend">
                {data.map((item) => (
                  <span className="lb-legend__item" key={item.title}>
                    <span className="lb-legend__dot" style={{ background: item.color }}></span>
                    {item.title} · {toNum(item.used).toFixed(2)} used
                  </span>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
