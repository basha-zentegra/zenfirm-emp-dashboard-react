import {useState, useEffect} from 'react'
import { formattedDate } from '../config'

const TodayPunch = () => {

    const [allEmp, setAllEmp] = useState([])
    const [present, setPresent] = useState([])


    useEffect(() => {
        const config = {
        report_name: "All_Employee",
        // criteria: "Email !='"
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        if(response.code === 3000){
            console.log("All Super Admin Employees:", response.data)
            setAllEmp(response.data.filter(e => e.Email))
            setPresent(response.data.filter(e => e.Email && e.Login_Time))
        } else{
            console.log(response)
        }
        
        })
        .catch((err) => console.error(err))
    
    }, [])


  return (
    <div>

 <section class="py-">
                          <div class="container py-3 px-5">
                             
                            <div class="row">
                              <div class="col-md-6 col-lg-3 border-top border-bottom border-end-md ">
                                 
                                <div class="py-4 text-center">
                                  <div class="mb-2">
    
                                        <i class="bi bi-people text-info fs-2"></i>
                                  </div>
                                  <div class="lh-1">
                                    <h5 class="mb-1">{allEmp.length}</h5>
                                    <span>Employee</span>
                                  </div>
                                </div>

                              </div>
                              <div class="col-md-6 col-lg-3 border-top border-bottom border-end-lg ">
                                 
                                <div class="py-4 text-center">
                                  <div class="mb-2">
                                    <i class="bi bi-person-check text-success fs-2"></i>

                                  </div>
                                   
                                  <div class="lh-1">
                                    <h5 class="mb-1">{present.length}</h5>
                                    <span>Present</span>
                                  </div>
                                </div>

                              </div>
                              <div class="col-md-6 col-lg-3 border-top border-bottom border-end-md ">
                                 
                                <div class="py-4 text-center">
                                  <div class="mb-2">
                                    <i class="bi bi-person-x text-danger fs-2"></i>
                                  </div>
                                   
                                  <div class="lh-1">
                                    <h5 class="mb-1">{allEmp.length - present.length}</h5>
                                    <span>Absent</span>
                                  </div>
                                </div>

                              </div>
                              <div class="col-md-6 col-lg-3 border-top border-bottom ">
                                 
                                <div class="py-4 text-center">
                                  <div class="mb-2">
                                    <i class="bi bi-clock text-warning fs-2"></i>
                                  </div>
                                   
                                  <div class="lh-1">
                                    <h5 class="mb-1">-</h5>
                                    <span>Late</span>
                                  </div>
                                </div>

                              </div>

                            </div>
                          </div>

                        </section>



<section>
    <table className='table'>

        <thead className='table-primary'>
            <tr>
                <td >Name</td>
                <td className='text-center'>Status</td>
                <td className='text-center'>Login</td>
            </tr>
        </thead>
        <tbody>

            
        {allEmp.map(e => (
            
            <tr>
                <td >
                    {e?.Name}
                </td>
                <td className='text-center'>
                    <span className={`attendance-status ${e?.Check.toLowerCase()}`}>{e?.Check || "-"}</span>
                </td>
                <td className='text-center'>
                    {e?.Login_Time.slice(0,10) === formattedDate ? e?.Login_Time.slice(10) : " " }
                </td>
            </tr>
        ))}
            
        </tbody>

    </table>
</section>


    </div>
  )
}

export default TodayPunch