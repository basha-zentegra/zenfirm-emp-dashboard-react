import { useState, useEffect } from 'react';
import ITRChart from './ITRChart';
import { useUser } from '../../context/UserContext';


const ITRDashboard = () => {
    
    const {nmgEmp} = useUser()

    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [allDataWithCount, setAllDataWithCount] = useState([]);

    const employees = nmgEmp || [];

    // const employees = [
    //     "Abdul_portal",
    //     "Vinay",
    //     "Srinivasa",
    //     "Sneha",
    //     "Karthik",
    //     "Disha",
    //     "bash_portal",
    //     "Tejas Prahalad",
    //     "Arya P R",
    //     "Abhinand CK",
    //     "Rudresh NMG213",
    //     "Lokesh E",
    //     "Basha A",
    //     "Roy Vargis CPA",
    //     "Ajayan P S",
    //     "Aneesh P",
    //     "Nithish S",
    //     "Pachiyappan C",
    //     "Sunil Shivadev",
    //     "Dayananda R",
    //     "Praveen Paul"
    // ];

    const itrStatuses = [
        { label: "ITR Organizer", key: "itrOrganizer" },
        { label: "Follow up 1", key: "followUp1" },
        { label: "Follow up 2", key: "followUp2" },
        { label: "ITR Ready for Preparer", key: "itrReadyForPreparer" },
        { label: "ITR Pending Client", key: "itrPendingClient" },
        { label: "ITR Additional Docs Received", key: "itrAdditionalDocsReceived" },
        { label: "ITR Ready for Reviewer", key: "itrReadyForReviewer" },
        { label: "ITR Ready for Peer Review", key: "itrReadyForPeerReview" },
        { label: "ITR Ready for Sign", key: "itrReadyForSign" },
        { label: "ITR Sent for Esign", key: "itrSentForEsign" },
        { label: "ITR Sent for Manual Sign", key: "itrSentForManualSign" },
        { label: "ITR Sent for Paperfiling", key: "itrSentForPaperfiling" },
        { label: "ITR Ready for Efile", key: "itrReadyForEfile" },
        { label: "ITR Awaiting Acks", key: "itrAwaitingAcks" },
        { label: "ITR Completed", key: "itrCompleted" },
        { label: "ITR Cancelled", key: "itrCancelled" }
    ];

    // const allDataWithCount = []

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const employeeStatusData = {};

                // Initialize all employees with 0 counts
                employees.forEach((emp) => {
                    employeeStatusData[emp] = {};
                    itrStatuses.forEach((status) => {
                        employeeStatusData[emp][status.label] = 0;
                    });
                });

                // ✅ Only 16 API calls (one per status)
                // Then we group by employee from the response
                const promises = itrStatuses.map((status) => {
                    const config = {
                        report_name: "ITR_Report",
                        criteria: `ITR_Filing_Status=="${status.label}" `,
                        max_records : 1000
                        
                    };

                    return ZOHO.CREATOR.DATA.getRecords(config)
                        .then((response) => {


                            if (response.code === 3000 && response.data) {

                            console.log("ITR REPORT API DATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", response.data.length)


                                const records = response.data;

                                // Group records by employee
                                records.forEach((record) => {
                                    // ⚠️ Adjust field name to match your API
                                    const empName = record?.Current_Assignee || "";

                                    // Only count if employee exists in our list
                                    if (employeeStatusData[empName]) {
                                        employeeStatusData[empName][status.label] += 1;
                                    }
                                });

                                console.log(`${status.label}: ${records.length} records`);

                                // allDataWithCount.push({status.label : records.length})
                                setAllDataWithCount(prev => [...prev, {status: status.label, count: records.length}])

                            
                            }
                        })
                        .catch((err) => {
                            console.error(`Error fetching ${status.label}:`, err);
                        });
                });

                await Promise.all(promises);

                console.log("Final Data:", employeeStatusData);
                setChartData(employeeStatusData);

            } catch (err) {
                console.error("Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        console.log("nmgEmp",nmgEmp)

        fetchData();
    }, []);

      return (
          <div >
              
              <div className="row">
                  <div className="col-7">
                      <div className="card" style={{ height: " "}}>
                          <span className="cardsHeader ms-3 mt-2">ITR Chart</span>
                          <div className="card-body scroll-karo">
  
                              {loading && (
                                  <div className="d-flex justify-content-center align-items-center h-100">
                                      <div className="spinner-border text-primary" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                      </div>
                                      <span className="ms-2">Fetching data...</span>
                                  </div>
                              )}
  
                              {error && (
                                  <div className="alert alert-danger mt-3">
                                      Error: {error}
                                  </div>
                              )}
  
                              {!loading && !error && chartData && (
                                  <ITRChart
                                      employeeStatusData={chartData}
                                      itrStatuses={itrStatuses}
                                  />
                              )}
  
                          </div>
                      </div>
                  </div>
  
                   <div className="col-5">
                      <div className="card" style={{ height: " "}}>
                          <span className="cardsHeader ms-3 mt-2">ITR Status</span>
                          <div className="card-body scroll-karo">
  
                              {loading && (
                                  <div className="d-flex justify-content-center align-items-center h-100">
                                      <div className="spinner-border text-primary" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                      </div>
                                      <span className="ms-2">Fetching data...</span>
                                  </div>
                              )}
  
                              {error && (
                                  <div className="alert alert-danger mt-3">
                                      Error: {error}
                                  </div>
                              )}
  
                              {!loading && !error && chartData && (
                                  <div>
                                      <table className='table'>
                                          <thead className='table-primary'>
                                              <tr>
                                                  <td>ITR Filing Status (ITR)</td>
                                                  <td>Record Count (ITR)</td>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              {allDataWithCount.map(e=> (
                                                  <tr>
                                                      <td>{e.status}</td>
                                                      <td>{e.count}</td>
                                                  </tr>
                                              ))}
                                              
                                          </tbody>
  
                                      </table>
                                  </div>
                              )}
  
                          </div>
                      </div>
                  </div>
  
  
                  
  
              </div>
          </div>
      );
}

export default ITRDashboard