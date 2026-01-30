import {useState} from 'react'
import { APP_NAME } from '../../config';

const AddKanbanLIst = ({selectedProject, setKanbanList,setHideList}) => {

    const [textareaList, setTextAreaList] = useState('');

    if(!selectedProject){
        return null;
    }

    const closeOffCanvas = () => {
      const element = document.getElementById("addkanbanlistoffcanvas");
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(element);
      bsOffcanvas?.hide();
  
    }

    function addKanbanList(){

        var config = {
            app_name: APP_NAME,
            report_name: "My_Team_Projects",
            id: selectedProject?.ID,
            payload: {
                data: {
                    Kanban_List: textareaList
                }}
        };

        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response.message);
                const listArray = textareaList.split(',').map(item => item.trim())
                setKanbanList(listArray)
                setHideList(false)
                closeOffCanvas()
            } 
        });

    }



    const handleTextarea = (e) => {
        setTextAreaList(e.target.value)
    }


    const handleSubmit = () => {

        if (!textareaList.trim()) {
            alert('Please enter at least one list');
            return
        }

        console.log('Lists:', textareaList)
        addKanbanList()
    }



  return (
    <>

        <div className="offcanvas offcanvas-end" tabIndex="-1" id="addkanbanlistoffcanvas" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="taskOffcanvasLable">Add Kanban Lists</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">

                
                <br/>
                <h5 className='mb-3'><i className="bi bi-journal text-primary me-2 "></i> {selectedProject?.Project_Name}</h5>

                <textarea rows={5} name="" value={textareaList} onChange={handleTextarea} className='form-control' placeholder='Comma Seprated Values...' id=""></textarea>
                <button onClick={handleSubmit} className='btn btn-primary mt-3'>Submit</button>

            </div>
        </div>
    </>
  )
}

export default AddKanbanLIst