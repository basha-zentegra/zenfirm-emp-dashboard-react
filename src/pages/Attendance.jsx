import {useEffect, useState} from 'react'
import { useUser } from '../context/UserContext'
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveHistory from '../components/leave/LeaveHistory';
import LeaveManagement from '../components/leave/LeaveManagement';
import MyLeaveRequests from '../components/leave/MyLeaveRequests';
import LeaveApplyForm from '../components/leave/Leaveapplyform';
import AllEmpLeaveBalance from '../components/leave/AllEmpLeaveBalance';
import Holidays from '../components/leave/Holidays';
import AllLeaves from '../components/leave/AllLeaves';
import AllLongLeaves from '../components/leave/AllLongLeaves';
import { startOfMonth, endOfMonth } from '../utils/dateUtils';

const Attendance = () => {

  const {USERID, isManager, isHR, thisMonthLongLeave = [], setThisMonthLongLeave} = useUser();

  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [lastMonthObj, setLastMonthObj] = useState({})

  const [activeTab, setActiveTab] = useState("my-requests");

  const [showAllEmp, setShowAllEmp] = useState(false)

  const [error, setError] = useState(false);

  const [longLeaveDates, setLongLeaveDates] = useState({start:"", end:"", reason:"", status:""})


  return (
    <div className='leaveapplyformbody'  style={{ marginLeft: "var(--zen-rail-width)"}}>

      <div className='container pt-2'>


      {error && (

        <div className="text-center d-flex justify-content-center align-items-center bg-danger-subtle rounded-3 py-2 t-2">

              {/* <img src="https://blogger.googleusercontent.com/img/a/AVvXsEj7BLeOSPmoqF-qU0YYEiw3p6XaaBR_BicN39f5lSU2FRwFCb-W4actcpvfPRb3E8hvfAJNOHTc35aQdy3kEr43lpeIC9cNFa9NnYKENxLXJ3FMeUrrpnd7JAkP9IIC4fXjFcFvANx2njFsABO8CMFkdYW99gysq_vZOIeLQ82ivRrSaSF6xSGCxtjXD4k" style={{width:"50px", opacity:"0.8"}} alt="" /> */}
              <i class="bi bi-exclamation-octagon-fill text-danger fs-1"></i>
              <p className='lead text-center ms-3 fw-medium'>
                Your leave records are not available. Please contact the HR team before applying for leave.
              </p>
              
        </div>

      )}
      

      <div className="d-flex justify-content-end p-2">

        <button className={`action-btn btn-sm ${showForm ? "btn-red" : "btn-blue"}`} disabled={error} onClick={() => {setShowForm(prev => !prev); setLongLeaveDates({start:"", end:"", reason:"", status:""})}}>
          

          {!showForm && ("Apply Leave")} {showForm && ("Close")}
        </button>
        
      </div>

      {!showForm && (
        <section>
          <LeaveBalanceCard setError={setError} />


          <div className="mt-3">
            {/* Tabs */}
            <ul className="nav nav-tabs border-0 mx-2">

              <li className="nav-item">
                <button
                  className={`btn ${activeTab === "my-requests" ? "action-btn btn-purple" : ""}`}
                  onClick={() => setActiveTab("my-requests")}
                >
                  <span>My Requests</span>
                </button>
              </li>

              {isManager && (

                <li className="nav-item">
                  <button
                    className={`btn ${activeTab === "leave-approvals" ? "action-btn btn-purple" : ""}`}
                    onClick={() => setActiveTab("leave-approvals")}
                  >
                    <span>Leave Approvals</span>
                  </button>
                </li>

              )}

              

              <li className="nav-item">
                <button
                  className={`btn ${activeTab === "credit-history" ? "action-btn btn-purple" : ""}`}
                  onClick={() => setActiveTab("credit-history")}
                >
                  <span>Credit History</span>
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`btn ${activeTab === "holidays" ? "action-btn btn-purple" : ""}`}
                  onClick={() => setActiveTab("holidays")}
                >
                  <span>Holidays</span>
                </button>
              </li>

              {isHR && (

                <li className="nav-item">
                  <button
                    className={`btn position-relative ${activeTab === "all-emp-balance" ? "action-btn btn-purple" : ""}`}
                    onClick={() => setActiveTab("all-emp-balance")}
                  >
                    <span>Emp Balance</span>
                    <i class="bi bi-shield-lock-fill position-absolute text-warning" 
                    style={{ fontSize: "10px", top: "2px", right: "4px" }}></i>
                  </button>
                </li>

              )}

              {isHR && (

                <li className="nav-item">
                  <button
                    className={`btn position-relative ${activeTab === "all-leaves" ? "action-btn btn-purple" : ""}`}
                    onClick={() => setActiveTab("all-leaves")}
                  >
                     <span>Leaves</span>
                    <i class="bi bi-shield-lock-fill position-absolute text-warning" 
                    style={{ fontSize: "10px", top: "2px", right: "4px" }}></i>
                  </button>
                </li>

              )}

              {isHR && (

                <li className="nav-item">
                  <button
                    className={`btn position-relative ${activeTab === "all-long-leaves" ? "action-btn btn-purple" : ""}`}
                    onClick={() => setActiveTab("all-long-leaves")}
                  >
                     <span>Planed Leaves </span>
                    <i class="bi bi-shield-lock-fill position-absolute text-warning" 
                    style={{ fontSize: "10px", top: "2px", right: "4px" }}></i>
                  </button>
                </li>

              )}

              

            </ul>

            {/* Content */}
            <div className="tab-content">

              {activeTab === "my-requests" && <MyLeaveRequests />}

              {activeTab === "leave-approvals" && <LeaveManagement/>}

              {activeTab === "credit-history" && <LeaveHistory  />}

              {activeTab === "holidays" && <Holidays  />}

              {activeTab === "all-emp-balance" && <AllEmpLeaveBalance  />}

              {activeTab === "all-leaves" && <AllLeaves  />}

              {activeTab === "all-long-leaves" && <AllLongLeaves  />}


              

            </div>
          </div>




        </section>
      )}

      
      {showForm && (


        <LeaveApplyForm longLeaveDates={longLeaveDates}/>

      )}

      <div className="toast-container mt-5">
        
        {!showForm && thisMonthLongLeave?.map(e => {
          return (
            <div className='toast1 bg-zen-subtle text-dark px-4 cursor-pointer' onClick={() => {
                    setShowForm(true); 
                    setLongLeaveDates({start:e.From, end:e.To, reason:e.Reason, status:"Approved"})
                    setThisMonthLongLeave([])
                  
                  } }>

              <div className="toast1-icon">
                <img src="https://cdn-icons-png.flaticon.com/128/2832/2832064.png" width="30px" alt="" />
              </div>

              <div className="toast1-content">
                <div className="toast1-title">
                  
                  Convert your Planned leave
                  
                </div>
                <div>Click here and convert your {Math.floor(e.No_of_Days_Leave)} days of planned leave From {e.From} To {e.To}</div>
              </div>

            </div>
            
          )
        })}
      </div>

      

      </div>
    </div>
  )
}

export default Attendance



