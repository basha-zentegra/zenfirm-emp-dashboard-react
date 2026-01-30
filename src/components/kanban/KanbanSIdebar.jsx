import {useState} from 'react'
import { useUser } from '../../context/UserContext'

const KanbanSIdebar = ({setSelectedProject}) => {


    const {projects} = useUser();

    const [activeProjectId, setActiveProjectId] = useState(null)

    const handleClick = (project) => {
        setSelectedProject(project)
        setActiveProjectId(project.ID)
        console.log(project)
    }


  return (
    <div className='m-3 me-1'>
        <h6 className='text-primary text-uppercase'>Projects</h6>

        {projects.map(element => (
        <div
            key={element.ID}
            className={`p-2 border border-start-0 border-end-0 border-bottom-0 ${activeProjectId === element.ID ? 'bg-purple-light rounded-3' : ''}`}
        >
                
                <small className='cursor-pointer fw-medium ' key={element.ID} onClick={() => handleClick(element)}>{element?.Project_Name}</small>
           
            </div>
        ))}
    </div>
  )
}

export default KanbanSIdebar