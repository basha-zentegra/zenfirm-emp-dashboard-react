import React from 'react'
import { useUser } from '../../context/UserContext'

const KanbanSIdebar = ({setSelectedProject}) => {


    const {projects} = useUser();

    const handleClick = (project) => {
        setSelectedProject(project)
        console.log(project)
    }


  return (
    <div className='m-3 me-1'>
        <h6 className='text-primary text-uppercase'>Projects</h6>

        {projects.map(element => (
            <div className='border border-start-0 border-end-0 border-bottom-0 py-2'>
                
                <small className='cursor-pointer fw-medium ' key={element.ID} onClick={() => handleClick(element)}>{element?.Project_Name}</small>
           
            </div>
        ))}
    </div>
  )
}

export default KanbanSIdebar