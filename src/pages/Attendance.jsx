import {useState} from 'react'
import { useUser } from '../context/UserContext'
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveHistory from '../components/leave/LeaveHistory';
import LeaveManagement from '../components/leave/LeaveManagement';
import MyLeaveRequests from '../components/leave/MyLeaveRequests';

const Attendance = () => {

  const {USERID} = useUser();

  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [lastMonthObj, setLastMonthObj] = useState({})

  const [activeTab, setActiveTab] = useState("my-requests");

  return (
    <div className='container'>

      <div className="text-center d-flex justify-content-center align-items-center bg-warning-subtle rounded-3 py-2 mt-2">

            <img src="https://blogger.googleusercontent.com/img/a/AVvXsEj7BLeOSPmoqF-qU0YYEiw3p6XaaBR_BicN39f5lSU2FRwFCb-W4actcpvfPRb3E8hvfAJNOHTc35aQdy3kEr43lpeIC9cNFa9NnYKENxLXJ3FMeUrrpnd7JAkP9IIC4fXjFcFvANx2njFsABO8CMFkdYW99gysq_vZOIeLQ82ivRrSaSF6xSGCxtjXD4k" style={{width:"50px", opacity:"0.8"}} alt="" />

            <p className='lead text-center ms-3 fw-medium'>Below data is for testing purpose, Our team is working on it.</p>
            
      </div>

      <div className="d-flex justify-content-end p-3">
        <button className='btn btn-sm btn-primary' onClick={() => setShowForm(prev => !prev)}>Apply Leave</button>
        
      </div>

      {!showForm && (
        <section>
          <LeaveBalanceCard />
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

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "leave-approvals" ? "active" : ""}`}
                  onClick={() => setActiveTab("leave-approvals")}
                >
                  Leave Approvals
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "credit-history" ? "active" : ""}`}
                  onClick={() => setActiveTab("credit-history")}
                >
                  Credit History
                </button>
              </li>

            </ul>

            {/* Content */}
            <div className="tab-content">

              {activeTab === "my-requests" && <MyLeaveRequests />}

              {activeTab === "leave-approvals" && <LeaveManagement/>}

              {activeTab === "credit-history" && <LeaveHistory  />}

            </div>
          </div>















          {/* <div className="text-center">

            <img src="https://blogger.googleusercontent.com/img/a/AVvXsEj7BLeOSPmoqF-qU0YYEiw3p6XaaBR_BicN39f5lSU2FRwFCb-W4actcpvfPRb3E8hvfAJNOHTc35aQdy3kEr43lpeIC9cNFa9NnYKENxLXJ3FMeUrrpnd7JAkP9IIC4fXjFcFvANx2njFsABO8CMFkdYW99gysq_vZOIeLQ82ivRrSaSF6xSGCxtjXD4k" style={{width:"280px", opacity:"0.8"}} alt="" />

            <p className='lead text-center'>Above data is for testing purpose, Our team is working on it.</p>
            
          </div> */}

        </section>
      )}

      

      

      

      {showForm && (

        <iframe height='700px' width='100%' frameborder='0' allowTransparency='true' scrolling='auto' src={`https://creatorapp.zohopublic.in/zentegraindia/zenfirm/form-embed/Request_Leave/gfykTe4xO2Dpgd9RfbbaBtrT411kNv1DP5SWsTRZqfsjvGYAj7Q3fBdWMYSJEmhT58mmJ1vm1Wn5k04DBWk3YKvdwMrNOrA7F6vJ?Employee_Name=${USERID}`}></iframe>

      )}

      
    </div>
  )
}

export default Attendance



