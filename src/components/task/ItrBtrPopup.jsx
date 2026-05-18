import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

const ItrBtrPopup = ({setShowItrPopup,projectId}) => {

    const {USERID} = useUser();

    const [itrReport, setItrReport] = useState(null);
    const [error, setError] = useState(false);




    function fetchITRId(){
        var config = {
            report_name: "ITR_Report",
            criteria: `Project.ID==${projectId}`
        };
        ZOHO.CREATOR.DATA.getRecords(config).then(function (response) {
            console.log(response);

            if(response.code === 3000){
                setItrReport(response.data[0])
            }else{
                setError(true)
            }
            
        });
    }

    useEffect(()=> {

        if(!projectId) return;

        fetchITRId();

    },[projectId])


  return (
   <div style={styles.overlay}>
    <div style={styles.popup}>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>

        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setShowItrPopup(false)}
        >
          Close
        </button>
      </div>

      <section>

        {/* <p className='mb-2'>Popup</p> */}


        {itrReport && (
            <iframe style={{height:"80vh", width: "100%"}} class="itriframe" src={`https://creatorapp.zohopublic.in/zentegraindia/zenfirm/ITR/record-edit/ITR_Report/${itrReport.ID}/j5CAPWKesd06OT3Zr9Yjf5vEE9tMVdNFdv21Cg84ZpBYkTmFd257YbKh4Agyzxpu18dGstmg3KJAAaDxPYQyfy2JdbHbBKdKT0zg?params=${USERID}&Hide_Fields=true&widget=dashboard`} frameborder="0"></iframe>

        )}

        {error && (
            <p className='mb-2'>Error fetching data</p>
        )}

      </section>
    </div>
  </div>
  )
}

export default ItrBtrPopup

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  popup: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "80vw",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
};