import {useState,useEffect} from 'react'
import { useUser } from '../../context/UserContext';

const TaskNotes = ({selectedEvent, setEvents}) => {

    const {USERID} = useUser()

    const [notes, setNotes] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState("");

    useEffect(()=>{

        setNotes(selectedEvent?.Notes || [])

    },[selectedEvent])

    const startAdding = () => {
        setIsAdding(true)
    }

    const handleInputChange = (value) => {
        setNewNote(value);
    };

    const cancelAdding = () => {
        setNewNote("")
        setIsAdding(false)
    };

    const saveItem = () => {
        if(!newNote.trim()) return

        var config = {
                form_name: "Notes",
                payload: {
                    data: {
                            Note: newNote.trim(),
                            Task: selectedEvent?.ID,
                            Project: selectedEvent?.Project_Name?.ID,
                            Added_by: USERID
                    }
                }
        };
        ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response);
                    const updated = {
                        ID:response?.data?.ID,
                        Note: newNote.trim(),
                        Added_by: {Name:"you", ID: "123",zc_display_value: "you"}
                    }
                    setNotes(prev => [...prev, updated ])
                    setEvents(prev => 
                      prev.map(event => event.ID === selectedEvent.ID ? {...event, Notes: [...event.Notes, updated]} : event )
                    )
                    setNewNote("");
                    setIsAdding(false);
            }
        });
        
    }

    // Note: noteContent,
    //                 Task: TID,
    //                 Project: selecteProject,
    //                 Added_by: USERID

  return (
    <div className=''>
        <div className="card shadow-shopify border-0 mb-4 mt-3 rounded-4">
            <div className="card-body">
                <ul className="list-group">
                    {notes.map((note, index) => (
                        <li key={index} className="list-group-item">
                            {note?.Note} <small style={{fontSize:"10px"}} className='text-muted'>~{note?.Added_by?.Name || "someone"}</small>
                        </li>
                    ))}
                </ul>

                {isAdding && (
                  <li className="list-group-item px-0 border-0">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter checklist item..."
                      value={newNote}
                      onChange={(e) =>
                        handleInputChange(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveItem();
                        if (e.key === "Escape") cancelAdding();
                      }}
                      onBlur={(e) => {
                        if (!newNote.trim()) cancelAdding();
                      }}
                      autoFocus
                    />
                  </li>
                )}
         

              {/* Add Button */}
              {!isAdding && (
                <button
                  className="btn btn-link text-decoration-none mt-2"
                  onClick={() => startAdding()}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Note
                </button>
              )}

            </div>
        </div>
    </div>
  )
}

export default TaskNotes