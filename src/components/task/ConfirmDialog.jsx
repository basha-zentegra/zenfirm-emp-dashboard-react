import React from 'react'

const ConfirmDialog = ({confirmDelete,cancelDelete}) => {
  return (
   <div style={styles.overlay}>
    <div style={styles.popup}>
      <p className='mb-2'>Are you sure you want to delete?</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          className="btn btn-sm btn-secondary"
          onClick={cancelDelete}
        >
          Cancel
        </button>

        <button
          className="btn btn-sm btn-danger"
          onClick={confirmDelete}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
  )
}

export default ConfirmDialog

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
    width: "300px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
};