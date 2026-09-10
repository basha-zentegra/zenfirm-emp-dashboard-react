import {useState, useEffect, useRef, useCallback} from "react";
import "../../css/Announcements.css";
import { formattedDate } from "../../config";

const icons = {"Birthday": "bi bi-cake-fill", "HR": "bi bi-people-fill", "New Feature": "bi bi-terminal-fill" }

const SEEN_KEY = "zf_seen_announcements";
const SEEN_LIMIT = 200; // KEEPS THE STORED LIST FROM GROWING FOREVER

// STABLE IDENTITY PER ANNOUNCEMENT — REAL RECORDS CARRY AN ID,
// BIRTHDAYS ARE BUILT CLIENT-SIDE SO THEY GET A SYNTHETIC PER-YEAR KEY
const getKey = (a) => a?._key || a?.ID || `${a?.Type_field}-${a?.Heading}`;

const readSeen = () => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null; // PRIVATE MODE / STORAGE BLOCKED — HIGHLIGHT JUST STAYS OFF
  }
};

const writeSeen = (keys) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(keys.slice(-SEEN_LIMIT)));
  } catch {
    /* NOTHING TO DO — SEEN TRACKING IS A NICETY, NOT A REQUIREMENT */
  }
};

const Announcements = () => {

    const [announcements,setAnnouncements] = useState([])
    const [newKeys, setNewKeys] = useState(() => new Set())

    // ON A BRAND NEW BROWSER EVERY ITEM WOULD COUNT AS "NEW" — SEED SILENTLY INSTEAD
    const firstVisitRef = useRef(undefined)
    if (firstVisitRef.current === undefined) firstVisitRef.current = readSeen() === null

    const fetchBirthDays = async () => {
        try {
          const res = await ZOHO.CREATOR.DATA.getRecords({report_name: "All_Employee", criteria: `Date_of_Birth.contains("${formattedDate.slice(0,5)}")`})
  
          console.log("Birthday Report",res)
  
          if(res.code == 3000){
            
            //   setAnnouncements(res.data);

            const Birthdays= res.data.map( e => ({
                _key: `bday-${e.ID}-${new Date().getFullYear()}`,
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

    // FLAG ANYTHING THE USER HAS NOT SEEN BEFORE, THEN REMEMBER IT SO IT ONLY GLOWS ONCE
    useEffect(() => {
      if (!announcements.length) return

      const keys = announcements.map(getKey)
      const stored = readSeen() || []

      if (firstVisitRef.current) {
        writeSeen([...new Set([...stored, ...keys])])
        return
      }

      const unseen = keys.filter(k => !stored.includes(k))
      if (!unseen.length) return

      setNewKeys(prev => new Set([...prev, ...unseen]))
      writeSeen([...stored, ...unseen])
    }, [announcements]);

    const markRead = useCallback((key) => {
      setNewKeys(prev => {
        if (!prev.has(key)) return prev
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, []);

    const markAllRead = useCallback(() => setNewKeys(new Set()), []);

    const newCount = newKeys.size

  return (
    <div className="card border-0 rounded-4 shadow-sm overflow-hidden biometric-card homecards h-100" >
      <div className="card-header bg-white border-0 pb-1 d-flex align-items-center justify-content-between">        
        <span className="ms-1 fw-medium" style={{fontSize:"18px",color:"#8593e8"}}> 
           <i className={`bi bi-megaphone me-2 ${newCount ? "announce-bell-ring" : ""}`}></i> Announcement </span>

        {newCount > 0 && (
          <button
            type="button"
            className="announce-count-pill"
            onClick={markAllRead}
            title="Mark all as read"
          >
            {newCount} new
          </button>
        )}
      </div>

      {/* Announcement List */}
      <div className="card-body pt-1 scroll-karo ">
        {announcements.map((announcement) => {
        //   const Icon = announcement.icon;
          const key = getKey(announcement);
          const isNew = newKeys.has(key);

          return (
            <div
              className={`announcement-item ${isNew ? "is-new" : ""}`}
              key={key}
              onClick={() => markRead(key)}
              title={isNew ? "Click to mark as read" : undefined}
            >
              <div className={`announcement-icon ${announcement?.Type_field?.toLowerCase().replace(" ", "-")}`}>
                
                <i className={icons[announcement.Type_field] || "bi bi-bell-fill"}></i>
              </div>

              <div className="announcement-content">
                <div className="announcement-title-row">
                  <h4>{announcement.Heading}</h4>

                  {isNew && <span className="new-flag">NEW</span>}

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