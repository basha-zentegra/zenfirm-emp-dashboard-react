import {useState} from 'react'
import { useUser } from '../context/UserContext'
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';

const Attendance = () => {

  const {USERID} = useUser();

  const [showForm, setShowForm] = useState(false)

  return (
    <div className='container'>

      <div className="d-flex justify-content-end p-3">
        <button className='btn btn-sm btn-primary' onClick={() => setShowForm(prev => !prev)}>Applay Leave</button>
      </div>

      {!showForm && (
        <section>
          <LeaveBalanceCard />


          <div className="text-center">

            <img src="https://blogger.googleusercontent.com/img/a/AVvXsEj7BLeOSPmoqF-qU0YYEiw3p6XaaBR_BicN39f5lSU2FRwFCb-W4actcpvfPRb3E8hvfAJNOHTc35aQdy3kEr43lpeIC9cNFa9NnYKENxLXJ3FMeUrrpnd7JAkP9IIC4fXjFcFvANx2njFsABO8CMFkdYW99gysq_vZOIeLQ82ivRrSaSF6xSGCxtjXD4k" style={{width:"280px", opacity:"0.8"}} alt="" />

            <p className='lead text-center'>Above data is for testing purpose, Our team is working on it.</p>
            
          </div>

        </section>
      )}

      

      {showForm && (

        <iframe height='700px' width='100%' frameborder='0' allowTransparency='true' scrolling='auto' src={`https://creatorapp.zohopublic.in/zentegraindia/zenfirm/form-embed/Request_Leave/gfykTe4xO2Dpgd9RfbbaBtrT411kNv1DP5SWsTRZqfsjvGYAj7Q3fBdWMYSJEmhT58mmJ1vm1Wn5k04DBWk3YKvdwMrNOrA7F6vJ?Employee_Name=${USERID}`}></iframe>

      )}

      
    </div>
  )
}

export default Attendance



