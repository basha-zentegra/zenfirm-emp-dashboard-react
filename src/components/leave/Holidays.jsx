import {useEffect,useState} from 'react'
// import {MMDDYYYY_TO_DDMMYYYY} from ''
import { MMDDYYYY_TO_DDMMYYYY } from '../../utils/dateUtils';




const Holidays = () => {

    const [holidays, setHolidays] = useState([]);

      useEffect(() => {
        const fetchLeaves = async () => {
          try {
            const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "Office_Holiday__List", criteria: `Even_Type == "Holiday"`})
    
            console.log(res)
    
            if(res.code == 3000){
                setHolidays(res.data);
            }
    
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchLeaves();
      }, []);


  return (
    <>

        {/* {holidays.map( e => (<p key={e.ID}>{e.Event_Name}</p>) )} */}

    <div className="container mt-3">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-4 fw-semibold">Holidays</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle leave-request-table">
              <thead className="text-muted my-thead text-uppercase">
                <tr className="text-muted">
                  <th className="text-muted fw-normal" >Holiday Name</th>
                  <th className="text-muted fw-normal">Date <span className='text-lowercase small'>(dd-mm-yyyy)</span></th>
                  
                </tr>
              </thead>

              <tbody>
                {holidays.map((e) => (
                  <tr key={e.ID} className="tr-hight">
                    <td className="fw-medium">{e?.Event_Name || "Name"}</td>
                    <td className="fw-medium"><span className='badge px-3 py-2 fw-medium bg-primary-subtle text-primary'>{MMDDYYYY_TO_DDMMYYYY(e?.Date_field) || "Date"}</span></td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Holidays