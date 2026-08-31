import {useState, useEffect} from "react";
import "../../css/Announcements.css";
import { formattedDate } from "../../config";

const icons = {"Birthday": "bi bi-cake-fill", "HR": "bi bi-people-fill", "New Feature": "bi bi-terminal-fill" }

const Announcements = () => {

    const [announcements,setAnnouncements] = useState([])

    const fetchBirthDays = async () => {
        try {
          const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "All_Employee", criteria: `Date_of_Birth.contains("${formattedDate.slice(0,5)}")`})
  
          console.log("Birthday Report",res)
  
          if(res.code == 3000){
            
            //   setAnnouncements(res.data);

            const Birthdays= res.data.map( e => ({
                Heading: `${e.Name}'s Birthday 🎉`, 
                Message: "Cheers to another wonderful year! Happy Birthday from Team ZenFirm!", 
                Type_field: "Birthday",
                Added_Time: "Today"
            }))

            setAnnouncements(prev=> [...Birthdays, ...prev])

          }
  
        } catch (err) {
          console.error(err);
        }
      };

    useEffect(() => {
      const fetchAnnouncements = async () => {
        try {
          const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "All_Announcements", criteria: `Start_Date <= '${formattedDate}' && End_Date >= '${formattedDate}'`})
  
          console.log("Long Leave",res)
  
          if(res.code == 3000){
              setAnnouncements(res.data);
          }
  
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchAnnouncements();
      setTimeout(() => {
        fetchBirthDays();
        
      }, 1000);
    }, []);

  return (
    <div className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100" >
      <div className="card-header bg-white border-0 pb-1">        
        <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#8593e8"}}> 
           <i className="bi bi-megaphone me-2"></i> Announcement </span>
      </div>

      {/* Announcement List */}
      <div className="card-body pt-1 scroll-karo ">
        {announcements.map((announcement, index) => {
        //   const Icon = announcement.icon;

          return (
            <div className="announcement-item" key={index}>
              <div className={`announcement-icon ${announcement?.Type_field?.toLowerCase().replace(" ", "-")}`}>
                
                <i className={icons[announcement.Type_field] || "bi bi-bell-fill"}></i>
              </div>

              <div className="announcement-content">
                <div className="announcement-title-row">
                  <h4>{announcement.Heading}</h4>

                  {announcement.Type_field === "New Feature" && (
                    <span className="new-badge">Feature</span>
                  )}
                </div>

                <p>{announcement.Message}</p>

                <span className="announcement-time mt-2">
                  {announcement.Added_Time}
                </span>
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
            <>
            <div className="h-100 text-center align-items-center  opacity-50 mt-5">
                <img src="https://cdn-icons-png.flaticon.com/128/14906/14906187.png" width="80px" alt="" /><br />
                <small className="text-center text-muted">No Announcements Yet :)</small>
                
            </div>
            
            </>
        )}

      </div>


    </div>
  );
};

export default Announcements;