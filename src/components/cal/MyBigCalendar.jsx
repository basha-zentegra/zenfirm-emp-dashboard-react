import React, { useState,useEffect,useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { el, enUS } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { APP_NAME } from "../../config";
import OffcanvasTaskDetails from "./OffcanvasTaskDetails";
import AddTaskOffcanvas from "./AddTaskOffcanvas";
import UnScheduledTasks from "./UnScheduledTasks";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, getDay, locales,startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),  });
const DnDCalendar = withDragAndDrop(Calendar);

const MyBigCalendar = ({allTask}) => {

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [unscheduledTasks, setunscheduledTasks] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());


    const [startEnd, setStartEnd] = useState({});


    function parseEventDate(dateStr, timeStr) {

        if(!dateStr || !timeStr){
            return
        }

        // Split date
        const [month, day , year] = dateStr.split("-").map(Number);

        // Split time
        let [timePart, meridian] = timeStr.split(" "); // ["11:09:00", "PM"]
        let [hours, minutes, seconds] = timePart.split(":").map(Number);

        // Convert 12h to 24h
        if (meridian.toUpperCase() === "PM" && hours !== 12) {
            hours += 12;
        }
        if (meridian.toUpperCase() === "AM" && hours === 12) {
            hours = 0;
        }

        // month is 0-indexed in JS Date
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    const eventStyleGetter = (event) => {
        let backgroundColor = "#3174ad"; // default

        switch (event.priority) {
            case "high":
            backgroundColor = "#e74c3c"; // red
            break;
            case "medium":
            backgroundColor = "#f39c12"; // orange
            break;
            case "low":
            backgroundColor = "#2ecc71"; //#b5e0e6
            // backgroundColor = "#d1f5ea";
            // backgroundColor = "#b5e0e6"; 

            break;
            default:
            break;
    }
        return {
            style: {
            backgroundColor,
            borderRadius: "6px",
            color: "white",
            border: "none",
            padding: "2px 6px",
            opacity: event.taskStatus === "Completed" ? 0.5 : 0.8,
            
            },
        };
    };

    const CustomEvent = ({ event }) => {
        return (
            <div>
            <div className="mt-1" style={{ fontWeight: "600" }}>
                <i className={`bi bi-check2 me-1 ${event.taskStatus === "Completed" ? ' ' : 'd-none'}`} ></i>{event.title}</div>
            <div className="text-uppercase mt-2 fw-medium" style={{ fontSize: "12px", opacity: 0.8 }}>
                {event.projectName}
            </div>
            </div>
        );
    };

    function formatDateToMMDDYYYY(dateInput) {
        const date = new Date(dateInput);

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();

        return `${month}-${day}-${year}`;
    }

    function formatTimeToHHMM(dateInput) {
        const date = new Date(dateInput);

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    }


    //=============API====================
    function addEvent(title,start,end) {
        var config = {
            app_name: APP_NAME,
            form_name: "Task",
            payload: {
                data: {
                    Task_Name : title,
                    Start_Time: formatTimeToHHMM(start),
                    End_Time: formatTimeToHHMM(end),
                    Task_Date: formatDateToMMDDYYYY(start),
                    Task_Status: "Not Started",
                    Task_Priority: "Medium",
                    Assignee: USERID

            }
            }
        };
        ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response);
            } else{
            console.log(response);
            }
        }).catch(e => console.log(e))
    }

    function updateEvent(event, start,end){
        var config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            id: event.id,
            payload: {
                data: {
                    Start_Time: formatTimeToHHMM(start),
                    End_Time: formatTimeToHHMM(end),
                    Task_Date: formatDateToMMDDYYYY(start) 
            } }
        };
        ZOHO.CREATOR.DATA.updateRecordById(config).then(function (response) {
            if (response.code == 3000) {
                console.log(response);
            }else{
                console.log(response)
            }
        }).catch(e => console.log(e))
    }

    useEffect(() => {
        if (allTask.length > 0) {

            const newEvents = allTask.filter(eve => eve?.Task_Date && eve?.Start_Time).map(eve => ({
                id: eve.ID,
                title: eve.Task_Name,
                start: parseEventDate(eve.Task_Date, eve.Start_Time),
                end: parseEventDate(eve.Task_Date, eve.End_Time),
                priority: eve.Task_Priority.toLowerCase(),
                projectName: eve?.Project_Name?.Project_Name,
                taskStatus: eve?.Task_Status
            }));

            setEvents(newEvents); 

            console.log(newEvents)



            const newUnscheduled = allTask.filter(task => !task.Start_Time && !task.End_Time);
            setunscheduledTasks(newUnscheduled)
        }
    
    }, [allTask]); 

    //=============API END==================



    //=========== EVENT HANDLING ===========

    const handleEventDrop = ({ event, start, end }) => {

        if (event.taskStatus === "Completed") return;

        console.log(event, formatDateToMMDDYYYY(start) ,formatTimeToHHMM(start), formatTimeToHHMM(end))


        const updatedEvent = { ...event, start, end };

        if (isOverlapping(updatedEvent, events, event.id)) {
            alert("This move overlaps with another event!");
            return;
        }

        setEvents(prev => prev.map(e => (e.id === event.id ? { ...e, start, end } : e)));
        updateEvent(event, start,end)

    };

    const handleEventResize = ({ event, start, end }) => {
        if (event.taskStatus === "Completed") return;
        console.log(event, formatDateToMMDDYYYY(start) ,formatTimeToHHMM(start), formatTimeToHHMM(end))

        const resizedEvent = { ...event, start, end };

        if (isOverlapping(resizedEvent, events, event.id)) {
            alert("This resize overlaps with another event!");
            return;
        }

        setEvents(prev => prev.map(e => (e.id === event.id ? { ...e, start, end } : e)));
        updateEvent(event, start,end)
    };



    function isOverlapping(newEvent, events, ignoreEventId = null) {
        return events.some(event => {
            if (ignoreEventId && event.id === ignoreEventId) return false;

            return (
            newEvent.start < event.end &&
            newEvent.end > event.start
            );
        });
    }

    const handleSelectSlot = ({ start, end }) => {

        const newEvent = { start, end };

        setStartEnd(newEvent)

        if (isOverlapping(newEvent, events)) {
            alert("This time slot overlaps with an existing event!");
            return;
        }

        const element = document.getElementById("addtaskoffcanvas");
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();

    };

    const handleSelectEvent = (event) => {
        console.log("Event clicked:", event);
        // document.getElementById("taskOffcanvas").click()
        const element = document.getElementById("offcanvasRight");
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();


        // setSelectedEvent(event)

        var config = {
            app_name: APP_NAME,
            report_name: "Task_Report",
            id : event.id
        };
        ZOHO.CREATOR.DATA.getRecordById(config).then(function (response) {
            console.log(response,config);
            if(response.code === 3000){
            setSelectedEvent(response.data)
            }
            // 
        }).catch(e => console.log(e))
        
    };

    const handleUnScheduled = () => {
        // 
        const element = document.getElementById("unscheduledOffcanvass");
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();
    }

    

  return (
    <div className="me-1" style={{marginLeft:"80px"}}>
        <DndProvider backend={HTML5Backend}>
            <DnDCalendar
                localizer={localizer}
                events={events}
                defaultView="week"
                date={currentDate}
                onNavigate={date => setCurrentDate(date)} // updates current week
                style={{ height: "100vh", width: "100%"}}
                editable
                resizable
                selectable
                onSelectSlot={handleSelectSlot}  // drag to create event
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventStyleGetter}
                components={{event: CustomEvent}}
                min={new Date(1970, 0, 1, 11, 0)}   
                max={new Date(1970, 0, 1, 23, 59)}  
                onSelectEvent={handleSelectEvent}

            />
        </DndProvider>


        <OffcanvasTaskDetails selectedEvent={selectedEvent} />

        <AddTaskOffcanvas startEnd={startEnd} setEvents={setEvents}/>

        <button style={{position: "fixed", right:"29%", top:"-3px"}} className="d-non btn btn-sm border-secondary text-dark" onClick={handleUnScheduled}><i class="bi bi-hourglass-top"></i> Unscheduled</button>

        <UnScheduledTasks setEvents={setEvents} />

        {console.log("EVENTSSSS", events)}

    </div>
  )
}

export default MyBigCalendar