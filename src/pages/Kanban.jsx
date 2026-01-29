import {useState, useEffect} from 'react'
import KanbanSIdebar from '../components/kanban/KanbanSIdebar'
import { APP_NAME } from '../config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import React from 'react';
import OffcanvasTaskDetails from '../components/cal/OffcanvasTaskDetails';
import KanbanAddTask from '../components/kanban/KanbanAddTask';



const Kanban = () => {


    const [selectedProject, setSelectedProject] = useState(null);
    const [kanbanList, setKanbanList] = useState([])
    const [kanbanTasks, setKanbanTasks] = useState([])

    const [selectedTask, setSelectedTask] = useState(null)

    const [hideList, setHideList] = useState(false)

    const [selectedList, setSelectedList] = useState(null);



    useEffect(() => {
        if (!selectedProject) return

        if (selectedProject?.Kanban_List) {
            const listArray = selectedProject.Kanban_List.split(',').map(item => item.trim())
            setKanbanList(listArray)
            setHideList(false)

            console.log("kanbanList",kanbanList)
        } else{
            setHideList(true)
        }
    }, [selectedProject])


    useEffect(() => {
        if (!selectedProject) return
    
        const config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            criteria: `Project_Name.ID==${selectedProject?.ID}`
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
            if(response.code === 3000){
                console.log("Selected Project's Tasks:", response.data)
                const taskRes = response.data;

                setKanbanTasks(taskRes)
                
            }
            
            })
            .catch((err) => console.error(err))
    
    }, [selectedProject])


    function updateKanbanStatus(eventID, destination){
        var config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            id: eventID,
            payload: {
                data: {
                    Kanban_Status: destination,
                    
            } }
        };
        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response.message);
            }else{
                console.log(response)
            }
        }).catch(e => console.log(e))
    }

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        console.log(source, destination, draggableId)

        if (!destination) return; // dropped outside

        // If dropped in the same column and same index, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;


        // Find the task being moved
        const task = kanbanTasks.find(t => t.ID === draggableId);

        // Update the task's Kanban_Status to the new column
        const updatedTasks = kanbanTasks.map(t =>t.ID === task.ID ? { ...t, Kanban_Status: destination.droppableId } : t );

        setKanbanTasks(updatedTasks);
        updateKanbanStatus(draggableId, destination.droppableId);
    };


    const headerColor = ["headerColor0","headerColor1","headerColor2","headerColor3","headerColor4"]

    const clickTask = (taskID) => {

        const element = document.getElementById("offcanvasRight");
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();


        var config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            id : taskID
        };
        ZOHO.CREATOR.DATA.getRecordById(config).then(function (response) {
            // console.log(response,config);
            if(response.code === 3000){
                setSelectedTask(response.data)
            }
            // 
        }).catch(e => console.log(e))
        
    };

    const handleAddTask = (list) => {


        setSelectedList(list);

        const element = document.getElementById("addtaskoffcanvaskanban");
        if(!element) return;
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();

    } 




  return (
    <div className='d-flex ' style={{marginLeft:"72px"}}>

        

        <aside className='bg-white vh-100 w-350px border border-start-0 scroll-karo'>

          <KanbanSIdebar setSelectedProject={setSelectedProject}/>

        </aside>



        <main
          className='d-flex scroll-karo-x w-100 vh-100'
          
        >


<DragDropContext onDragEnd={handleDragEnd}>

  {!hideList && kanbanList.map((list, colIndex) => (
    <Droppable droppableId={list} key={colIndex}>

      {(provided) => (
        <div
          className='card w-350px border-0 rounded-0'
          style={{ flex: '0 0 auto' }}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >

          <div className={`card-header text-white rounded-0 fw-semibold ${headerColor[colIndex]}`}>{list}</div>

          <div className='card-body' style={{background: colIndex % 2 === 0 ? '#e2e7ee' : '#ebeff9'}}>
            {kanbanTasks.filter(task => task.Kanban_Status === list).map((task, taskIndex) => (
                <Draggable
                  draggableId={task.ID} 
                  index={taskIndex}
                  key={task.ID}
                >
                  {(provided) => (
                    <div
                      className='card mb-3 p-3 border-0 rounded-3'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div onClick={() => clickTask(task.ID)}>
                        <h6>{task.Task_Name}</h6>
                        <small className='text-muted'>{task?.Task_Description}</small>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
            <div className='text-center'>
                <button onClick={() => handleAddTask(list)} className='btn bg-white'> +</button>
            </div>
          </div>
          

        </div>
        
      )}
      

    </Droppable>
    

  ))}
</DragDropContext>


{kanbanList.length === 0 && (
    <div className='text-center w-100 align-content-center'>
        <img width="70px" className='mb-4' src="https://cdn-icons-png.flaticon.com/128/17952/17952229.png" alt="" />
        <h1 className='mb-5 lead'>Select the Project to Display the Kanban View</h1>
    </div>
)}

{hideList && (
    <div className='text-center w-100 align-content-center'>
        <img width="70px" className='mb-4' src="https://cdn-icons-png.flaticon.com/128/17952/17952229.png" alt="" />
        <h1 className='mb-5 lead'>Selected Project doesnot have Kanban View</h1>
    </div>
)}



        </main>


<OffcanvasTaskDetails selectedEvent={selectedTask} />

<KanbanAddTask list={selectedList} selectedProject={selectedProject} />

{/* {selectedProject && selectedList && (
  <KanbanAddTask
    list={selectedList}
    selectedProject={selectedProject}
  />
)} */}



    </div>
  )
}

export default Kanban
