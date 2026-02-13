import { useState, useEffect } from 'react';
import ITRChart from './ITRChart';
import { useUser } from '../../context/UserContext';

const BTRDashboard = () => {

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
            { label: "BTR Organizer", key: "btrOrganizer" },
            { label: "Follow up 1", key: "btrFollowUp1" },
            { label: "Follow up 2", key: "btrFollowUp2" },
            { label: "BTR Ready for Preparer", key: "btrReadyForPreparer" },
            { label: "BTR in Preparation", key: "btrInPreparation" },
            { label: "BTR Pending Client", key: "btrPendingClient" },
            { label: "BTR Additional Docs Received", key: "btrAdditionalDocsReceived" },
            { label: "BTR Ready for Reviewer", key: "btrReadyForReviewer" },
            { label: "BTR in Review", key: "btrInReview" },
            { label: "BTR Ready for Peer Review", key: "btrReadyForPeerReview" },
            { label: "BTR in Peer Review", key: "btrInPeerReview" },
            { label: "BTR Ready for Sign", key: "btrReadyForSign" },
            { label: "BTR Sent for Esign", key: "btrSentForEsign" },
            { label: "BTR Sent for Manual Sign", key: "btrSentForManualSign" },
            { label: "BTR Sent for Paperfiling", key: "btrSentForPaperfiling" },
            { label: "BTR Ready for Efile", key: "btrReadyForEfile" },
            { label: "BTR Awaiting Acks", key: "btrAwaitingAcks" },
            { label: "BTR Completed", key: "btrCompleted" },
            { label: "BTR Cancelled", key: "btrCancelled" }
        ];

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
                                report_name: "BTR_Report",
                                criteria: `BTR_Filing_Status=="${status.label}" `,
                                max_records : 1000
                                
                            };
        
                            return ZOHO.CREATOR.DATA.getRecords(config)
                                .then((response) => {
        
        
                                    if (response.code === 3000 && response.data) {
        
                                    console.log("BTR REPORT API DATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", response.data.length)
        
        
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
        
                fetchData();
            }, []);

  return (
    <div>




          <div className="row">
                      <div className="col-7">
                          <div className="card" style={{ height: " "}}>
                              <span className="cardsHeader ms-3 mt-2">BTR Chart</span>
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
                              <span className="cardsHeader ms-3 mt-2">BTR Status</span>
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
  )
}

export default BTRDashboard