import { useEffect, useState, useRef, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import ConfirmDialog from './ConfirmDialog';

const TaskAttachments = ({ selectedEvent }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);


  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);

    };

  const fileInputRef = useRef(null);

  const {userEmail} = useUser()

  useEffect(() => {
    setFiles(selectedEvent?.Files || []);
  }, [selectedEvent]);


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setLoading(true)

    var config = {
        form_name: "Files",
        payload: {
            data: {
                Project: selectedEvent?.Project_Name?.ID,
                Task: selectedEvent?.ID
            }
        }
    };

    ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
        console.log(response);
        if (response.code == 3000) {
            
            
                var config = {
                    report_name: "All_Files",
                    id : response.data.ID,
                    field_name : "File_field",
                    file : selectedFile
                };

                ZOHO.CREATOR.FILE.uploadFile(config).then(function (fileResponse) {
                    console.log(fileResponse);
                    const newFile = {
                        ID: response.data.ID, 
                        File_field: selectedFile.name,
                        fileObj: selectedFile, // useful for API
                    };
                    // 👉 Update UI immediately (optimistic)
                    setFiles((prev) => [...prev, newFile]);

                    // 👉 Reset input
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    setLoading(false)
                });
        } else{
            setLoading(false)
        }
    });


  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowConfirm(true);
  };

  const confirmDelete  = () => {
    if (!fileToDelete) return;
    


    var config = {
        report_name: "All_Files",
        id: fileToDelete.ID,
    };
    ZOHO.CREATOR.DATA.deleteRecordById(config).then(function (response) {

            console.log(response);

        if (response.code == 3000) {
            setFiles((prev) =>
                prev.filter((f) => f.ID !== fileToDelete.ID)
            );
            setShowConfirm(false);
            setFileToDelete(null);
        }
    });
  };

    const cancelDelete = () => {
        setShowConfirm(false);
        setFileToDelete(null);
    };

    const baseUrl = useMemo(() => {
        if (!userEmail) return null;

        if (userEmail.includes("@zentegra")) {
        return "https://creatorapp.zoho.in";
        }

        return "https://zenfirm.zohocreatorportal.in"; 
    }, [userEmail]);



 



const renderPreviewContent = (file) => {
  const url = baseUrl + file.File_field;

  if (!url) return <p>No preview available</p>;

  const fileName = file.File_field.toLowerCase();

  if (fileName.match(/\.(jpg|jpeg|png|gif|webp|heic)$/)) {
    return <img src={url} alt="preview" style={{ maxWidth: "100%" }} />;
  }

  if (fileName.endsWith(".pdf")) {

    const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(`https://creator.zoho.in/publishapi/v2/zentegraindia/zenfirm/report/All_Files/${file.ID}/File_field/download?privatelink=qwnEArdsy1UD58d13SSOxFHqX4U74QSQnv2uKsE2ZP7Ht47xsvfm3pNpJBp9TqhXavXf3OSby2wjn6EHxQggbaSqC0eYBzMA41Gm`)}`;

    return (
        <iframe
            src={pdfViewerUrl}
            title="pdf-preview"
            width="100%"
            height="400px"
        />
    );
  }

  return (
    <div>
      <p className='lead fs-5 text-muted'>Preview not available</p>
      <a className='btn btn-primary mt-4 btn-sm' href={url} download>
        Download File <i className="b- bi-download ms-2"></i>
      </a>
    </div>
  );
};

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mb-4 mt-3">
        <div className="card-body">

            {/* <p className="lead fs-5 text-center text-info">Our Team is working on it!</p> */}

          {/* Upload Section */}
          <div className="d-flex gap-2 mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              {loading ? (<div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>) : 'Upload' }
            </button>
          </div>

          {/* File List */}
          

          <ul className="list-group">

            {files.length === 0 && (
                <li className="text-muted list-group-item">No files uploaded</li>
            )}

            {files.map((file, index) => {
                const ext = file?.File_field?.split('.').pop()?.toLowerCase();
                const fileName = file?.File_field?.split('=').pop()
                const cleanName = fileName?.substring(fileName.indexOf('_') + 1);

                return (
                    <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center w-100"
                    >
                        <span className='w-100 d-flex align-items-center cursor-pointer' onClick={() => handlePreview(file)}>
                            <i className={`fs-4 bi bi-filetype-${ext} me-2`}></i>
                            <span>{cleanName}</span>
                        </span>

                        
                        <span className='d-flex'>
                            <i className="bi bi-trash text-danger cursor-pointer me-3" onClick={() => handleDeleteClick(file)}></i>
                            
                            <a className='text-dark' href={`${baseUrl}${file?.File_field}`}><i className="bi bi-download"></i></a>
                        </span>
                        
                    </li>
                )
                })}

          </ul>

        </div>
      </div>


{showConfirm && (
    <ConfirmDialog confirmDelete={confirmDelete} cancelDelete={cancelDelete} />
)}

{previewFile && (
  <div style={styles.overlay}>
    <div style={{ ...styles.popup, width: "800px" }}>
      
      <div className='d-flex justify-content-end'>
        {/* <strong>{previewFile.File_field}</strong> */}
        <button className="btn btn-sm btn-secondary" onClick={closePreview}>
          Close
        </button>
      </div>

      <div style={{ marginTop: "15px", textAlign: "center" }}>
        {renderPreviewContent(previewFile)}
      </div>

    </div>
  </div>
)}




    </div>
  );
};

export default TaskAttachments;



//thisapp.All_Logs.logsFilter()

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








//we are working harder then other departments
//we are working in weends and non-office hours also
//even i worked on my leave (i took leave and worked)

//i im underpaid here
//for fresher only 5 to 8 LPA they are provideing
//i hardwork deserve 6 lpa

//WHERE IS THE VALUE FOR MY HARDWORK