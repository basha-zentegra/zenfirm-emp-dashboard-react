import React from 'react'
import ZenBoardForm from './ZenBoardForm'

const NewOffcanvass = ({fetchBoards}) => {
  return (
    <div>

        
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="NewKanbanOffcanvass" aria-labelledby="taskOffcanvasLable" style={{width: "800px"}}>
            {/* <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="taskOffcanvasLable">New Offcanvass</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div> */}
            <div className="offcanvas-body">

           
              <ZenBoardForm fetchBoards={fetchBoards} />

            </div>
        </div>
    </div>
  )
}

export default NewOffcanvass