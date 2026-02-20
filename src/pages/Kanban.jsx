import {useState, useEffect, useRef} from 'react'
import KanbanSIdebar from '../components/kanban/KanbanSIdebar'
import { APP_NAME } from '../config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import React from 'react';
import OffcanvasTaskDetails from '../components/cal/OffcanvasTaskDetails';
import KanbanAddTask from '../components/kanban/KanbanAddTask';
import AddKanbanLIst from '../components/kanban/AddKanbanLIst';
import "../css/kanban.css";
import { useUser } from '../context/UserContext';



const Kanban = () => {

    const sidebarRef = useRef();

    const {empName} = useUser()

    const handleSomeAction = () => {
      console.log("CALLING FETCHBOARDS IN KANBAN PARENT")
      sidebarRef.current?.fetchBoards();
    };


    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [kanbanList, setKanbanList] = useState([])
    const [kanbanTasks, setKanbanTasks] = useState([])

    const [selectedTask, setSelectedTask] = useState(null)

    const [hideList, setHideList] = useState(false)

    const [selectedList, setSelectedList] = useState(null);

    const [newList, setNewList] = useState("")


    useEffect(() => {
        if (!selectedBoard) return

        if (selectedBoard?.Zenboard_Status) {
            const listArray = selectedBoard.Zenboard_Status.split(',').map(item => item.trim())
            setKanbanList(listArray)
            setHideList(false)
            setKanbanTasks([])

            console.log("kanbanList",kanbanList)
        } else{
            setHideList(true)
            setKanbanList([])
            setKanbanTasks([])
        }
    }, [selectedBoard])


    useEffect(() => {
        if (!selectedBoard) return
    
        const config = {
            report_name: "Task_Report",
            criteria: `Zenboards.ID==${selectedBoard?.ID}`
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
            if(response.code === 3000){
                console.log("Selected board's Tasks:", response.data)
                const taskRes = response.data;

                setKanbanTasks(taskRes)
                
            }
            
            })
            .catch((err) => console.error(err))
    
    }, [selectedBoard])


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

    function addNewKanbanList(newValue){
        var config = {
            report_name: "Zenboards_Report",
            id: selectedBoard?.ID,
            payload: {
                data: {
                    Zenboard_Status: newValue,
                    
            } }
        };
        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response.message, newValue);
                handleSomeAction()
            }else{
                console.log(response)
            }
        }).catch(e => console.log(e))
    }
    

const handleDragEnd = (result) => {
  const { destination, source, draggableId } = result;

  // If dropped outside a droppable area
  if (!destination) return;

  // If dropped in the same position
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return;

  // Get source and destination column tasks (sorted by order)
  const sourceColumn = kanbanTasks
    .filter(task => task.Kanban_Status === source.droppableId)
    .sort((a, b) => a.Kanban_Order - b.Kanban_Order);

  const destColumn = source.droppableId === destination.droppableId
    ? sourceColumn
    : kanbanTasks
        .filter(task => task.Kanban_Status === destination.droppableId)
        .sort((a, b) => a.Kanban_Order - b.Kanban_Order);

  // Remove the dragged task from the source column
  const draggedTask = sourceColumn[source.index];
  const newSourceColumn = [...sourceColumn];
  newSourceColumn.splice(source.index, 1);

  // Insert into destination column
  const newDestColumn = source.droppableId === destination.droppableId
    ? newSourceColumn
    : [...destColumn];
  newDestColumn.splice(destination.index, 0, draggedTask);

  // Build updated tasks with new order and status
  const updatedTasks = kanbanTasks.map(task => {
    // Update source column orders
    const sourceIdx = newSourceColumn.findIndex(t => t.ID === task.ID);
    if (sourceIdx !== -1 && source.droppableId !== destination.droppableId) {
      return { ...task, Kanban_Order: sourceIdx };
    }

    // Update destination column orders + status
    const destIdx = newDestColumn.findIndex(t => t.ID === task.ID);
    if (destIdx !== -1) {
      return {
        ...task,
        Kanban_Status: destination.droppableId,
        Kanban_Order: destIdx,
      };
    }

    return task;
  });

  setKanbanTasks(updatedTasks);

  
  updateKanbanStatus(draggableId, destination.droppableId);
    

  console.log("draggableId, destination.droppableId, destination.index")
  console.log(draggableId, destination.droppableId, destination.index)

  // Persist to backend if needed
  // updateTaskOrder(draggableId, destination.droppableId, destination.index);
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

    const handleAddKanbanList = () => {

      if (!newList.trim()) return;

      setKanbanList(prev =>{
        const updatedList = [...prev, newList]
        console.log(updatedList)
        addNewKanbanList(updatedList.join(', '))

        return updatedList;
      });
      setNewList("");
      setHideList(false)
        
    }

    // Pre-sort and group tasks by column
    const getColumnTasks = (status) => {
      return kanbanTasks
        .filter(task => task.Kanban_Status === status)
        .sort((a, b) => a.Kanban_Order - b.Kanban_Order); // Sort by order field
    }; 




  return (
    <div className='d-flex ' style={{marginLeft:"72px"}}>

        

        <aside className='bg-white vh-100 w-350px border border-start-0 scroll-karo'>

          <KanbanSIdebar ref={sidebarRef} setSelectedBoard={setSelectedBoard}/>

        </aside>



        <main
          className='d-flex scroll-karo-x w-100 vh-100'
          
        >

<DragDropContext onDragEnd={handleDragEnd}>
  {!hideList && kanbanList.map((list, colIndex) => (
    <Droppable droppableId={list} key={list}>
      {(provided) => (
        <div
          className='card w-350px border-0 rounded-0'
          style={{ flex: '0 0 auto' }}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className={`card-header text-white rounded-0 fw-semibold border-bottom-0 ${headerColor[colIndex]}`}>
            {list}
          </div>

          <div className='card-body' style={{ background: colIndex % 2 === 0 ? '#e2e7ee' : '#ebeff9' }}>
            {/* ✅ Sort by Kanban_Order */}
            {kanbanTasks
              .filter(task => task.Kanban_Status === list)
              .sort((a, b) => a.Kanban_Order - b.Kanban_Order)
              .map((task, taskIndex) => (
                <Draggable
                  draggableId={String(task.ID)}  // ✅ Ensure string
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
              <button onClick={() => handleAddTask(list)} className='btn bg-white'>+</button>
            </div>
          </div>
        </div>
      )}
    </Droppable>
  ))}
</DragDropContext>

{selectedBoard && (

  <div
    className='card w-350px border-0 rounded-0'
    style={{ flex: '0 0 auto' }}
  >
  <div className={`card-header text-white rounded-0 fw-semibold p-1 pb-0 border-bottom-0`}>
    <div className="input-group">
      <input 
        type="text" 
        className='form-control'
        value={newList} 
        onChange={(e) => setNewList(e.target.value)}
        placeholder='New Kanban List..'
      />
      <span onClick={handleAddKanbanList} className="input-group-text bg-primary text-white fw-medium cursor-pointer">+</span>

    </div>
  </div>

</div>

)}



{!hideList && kanbanList.length === 0 && (
    <div className='text-center w-100 align-content-center'>
        <img width="70px" className='mb-4' src="https://cdn-icons-png.flaticon.com/128/17952/17952229.png" alt="" />
        <h1 className='mb-5 lead'>Select the Board to Display the Kanban View</h1>
    </div>
)}

{/* {hideList && (
    <div className='text-center w-100 align-content-center'>
        <img width="70px" className='mb-4' src="https://cdn-icons-png.flaticon.com/128/17952/17952229.png" alt="" />
        <h1 className='mb-4 lead'>Selected Project doesnot have Kanban View</h1>
        <button onClick={handleAddKanbanList} className='btn btn-outline-success mb-5'>Add Kanban List</button>
    </div>
)} */}



        </main>


<OffcanvasTaskDetails selectedEvent={selectedTask} />

<KanbanAddTask list={selectedList} selectedBoard={selectedBoard} setKanbanTasks={setKanbanTasks} />

<AddKanbanLIst selectedProject={selectedProject} setKanbanList={setKanbanList} setHideList={setHideList} />

    </div>
  )
}

export default Kanban
