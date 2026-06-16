import React, { useState } from "react";
import "../css/logs.css";


const Logs = () => {
  const [showModal, setShowModal] = useState(false);

    const [manualLog, setManualLog] = useState({
        Date_field: new Date().toISOString().split("T")[0],
        Work_Started: "",
        Work_Ended: "", 
        Task: ""
    });

  return (
    <div style={{ marginLeft: "70px" }}>
      <h3>Logs</h3>

      <div className="text-end">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Log Time
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h4>Log Time</h4>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <label>Project Name</label>
                {/* <select>
                  <option>Select</option>
                </select> */}
                {/* <ProjectSelect/>  */}
                <ProjectSelect />
              </div>

              <div className="form-row">
                <label>Task Name *</label>
                <select>
                  <option>Select</option>
                </select>
              </div>

              <div className="form-row">
                <label>Date *</label>
                <input type="date" />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea rows="4"></textarea>
              </div>

              <div className="form-row">
                <label>Hours *</label>

                <div>
                  <label>
                    <input
                      type="radio"
                      name="hours"
                      defaultChecked
                    />
                    Total Hours
                  </label>

                  <label style={{ marginLeft: "20px" }}>
                    <input type="radio" name="hours" />
                    Start & End Time
                  </label>

                  <label style={{ marginLeft: "20px" }}>
                    <input type="radio" name="hours" />
                    Timer
                  </label>

                  <div style={{ marginTop: "10px" }}>
                    <input type="time" />
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="save-btn">Save</button>

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;