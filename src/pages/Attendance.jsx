import {useState} from 'react'
import { useUser } from '../context/UserContext'
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveHistory from '../components/leave/LeaveHistory';
import LeaveManagement from '../components/leave/LeaveManagement';
import MyLeaveRequests from '../components/leave/MyLeaveRequests';
import LeaveApplyForm from '../components/leave/Leaveapplyform';
import AllEmpLeaveBalance from '../components/leave/AllEmpLeaveBalance';
import Holidays from '../components/leave/Holidays';

const Attendance = () => {

  const {USERID, isManager} = useUser();

  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [lastMonthObj, setLastMonthObj] = useState({})

  const [activeTab, setActiveTab] = useState("my-requests");

  const [showAllEmp, setShowAllEmp] = useState(false)

  const [error, setError] = useState(false);

  return (
    <div className='leaveapplyformbody'  style={{ marginLeft: "70px"}}>

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
      

      <div className="d-flex justify-content-end p-3">

        <button className='btn btn-sm btn-primary' disabled={error} onClick={() => setShowForm(prev => !prev)}>
          
          {!showForm && ("Apply Leave")}
          {showForm && ("X")}
        </button>
        
      </div>

      {!showForm && (
        <section>
          <LeaveBalanceCard setError={setError} />
          {/* <div className="d-flex justify-content-end">
            <button className='btn btn-sm' onClick={() => setShowHistory(prev => !prev)}>Show History</button>
          </div> */}




          <div className=" mt-4">
            {/* Tabs */}
            <ul className="nav nav-tabs border-0">

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "my-requests" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-requests")}
                >
                  My Requests
                </button>
              </li>

              {isManager && (

                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "leave-approvals" ? "active" : ""}`}
                    onClick={() => setActiveTab("leave-approvals")}
                  >
                    Leave Approvals
                  </button>
                </li>

              )}

              

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "credit-history" ? "active" : ""}`}
                  onClick={() => setActiveTab("credit-history")}
                >
                  Credit History
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "holidays" ? "active" : ""}`}
                  onClick={() => setActiveTab("holidays")}
                >
                  Holidays
                </button>
              </li>

              {isManager && (

                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "all-emp-balance" ? "active" : ""}`}
                    onClick={() => setActiveTab("all-emp-balance")}
                  >
                    All Emp Balance
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

              

            </div>
          </div>




        </section>
      )}

      
      {showForm && (

        // <iframe height='700px' width='100%' frameborder='0' allowTransparency='true' scrolling='auto' src={`https://creatorapp.zohopublic.in/zentegraindia/zenfirm/form-embed/Request_Leave/gfykTe4xO2Dpgd9RfbbaBtrT411kNv1DP5SWsTRZqfsjvGYAj7Q3fBdWMYSJEmhT58mmJ1vm1Wn5k04DBWk3YKvdwMrNOrA7F6vJ?Employee_Name=${USERID}`}></iframe>

        <LeaveApplyForm />

      )}

      {/* {isManager && (

        <div className="text-center my-4">
          <span 
            className='small me-5 cursor-pointer' 
            onClick={()=>setShowAllEmp(p=>!p)}
          >All Employee Leave Balance 
          {!showAllEmp && (<i class="bi bi-chevron-double-down ms-2"></i>)}
          {showAllEmp && (<i class="bi bi-chevron-double-up ms-2"></i>)}
          </span>
        </div>

      )}

      

      {showAllEmp && (
        <AllEmpLeaveBalance />
      )} */}

      

      </div>
    </div>
  )
}

export default Attendance



