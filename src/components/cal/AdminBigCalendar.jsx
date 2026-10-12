import React, { useState, useEffect, useRef, useCallback, useMemo, use } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { APP_NAME, formattedDate, SUPER_ADMIN } from "../../config";
import OffcanvasTaskDetails from "./OffcanvasTaskDetails";
import AddTaskOffcanvas from "./AddTaskOffcanvas";
import UnScheduledTasks from "./UnScheduledTasks";

import { useUser } from "../../context/UserContext";
import { taskDuration } from "../../utils/taskUtils";
import ToastContainer from "../ui/ToastContainer";
import { objectToMM_DD_YYYY } from "../../utils/dateUtils";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  getDay,
  locales,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
});
const DnDCalendar = withDragAndDrop(Calendar);

const AdminBigCalendar = () => {

    const {orgEmp, USERID,userEmail,AllEmployees, projects} = useUser();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventID, setEventID] = useState(null);
  const [multipleTasks, setMultipleTasks] = useState([]); 
  const [events, setEvents] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startEnd, setStartEnd] = useState({});
  const [currentView, setCurrentView] = useState("day"); // day view works best with resources
  const [selectedResource, setSelectedResource] = useState("all"); // filter

  const [showHeader, setShowHeader] = useState(false)

    const [allTask, setAllTask] = useState([]);

  const [selectedResourceID, setSelectedResourceID] = useState(null);

  const [toasts, setToasts] = useState([]);

const showToast = (type, message) => {
  const id = Date.now();

  setToasts((prev) => [
    ...prev,
    { id, type, message },
  ]);
};

const removeToast = (id) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
};

  function fetchTasks(){
        const config = {
          app_name: APP_NAME,
          report_name: "Task_Report",
          // criteria: `Task_Date='${formatDateToMMDDYYYY(currentDate)}' && Start_Time!=null` && ${task_criteria},
          criteria: task_criteria,
          max_records : 1000,
          
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
            if(response.code === 3000){
              console.log("My All Tasks for Calendar:", response.data)
              const taskRes = response.data;

                setAllTask(taskRes)
              
            }
            console.log("response", response)
            
        }).catch((err) => {
          console.log(err)
          setAllTask([])

          // alert("Macha no task da..", allTask.length)
          console.log(allTask.length)

          showToast("warning", "No Task found in the Applied Filter!")
        })

        if(taskFilters.employee){
          setSelectedResource(taskFilters.employee)
        }else{
          setSelectedResource("all")
        }

  }

  // Multiple_Tasks is its own form with a `Task` lookup back to the parent, so the
  // slots are read from their own report — they are not a field on Task_Report.
  //
  // The slots are fetched for the date being viewed, then their parent tasks are
  // fetched by ID. The parents can't come from allTask: that is filtered to tasks
  // whose OWN Task_Date is the viewed date, while a slot's parent is usually dated
  // some other day.
  async function fetchMultipleTasks(){

        try {
          const slotRes = await ZOHO.CREATOR.DATA.getRecords({
            app_name: APP_NAME,
            report_name: "All_Multiple_Tasks",
            criteria: `Task_Date='${formatDateToMMDDYYYY(currentDate)}'`,
            max_records: 1000,
          });

          console.log("Multiple task slots:", slotRes);

          const slots = slotRes?.code === 3000 ? slotRes.data : [];

          const parentIds = [...new Set(
            slots.map((slot) => slot?.Task?.ID ?? slot?.Task).filter(Boolean).map(String)
          )];

          if (!parentIds.length) {
            setMultipleTasks([]);
            return;
          }

          // Same employee/department/project filters as the board, minus the date
          const parentCriteria = `(${parentIds.map((id) => `ID==${id}`).join(" || ")})`
            + (dynamicCriteria ? ` && ${dynamicCriteria}` : "");

          const parentRes = await ZOHO.CREATOR.DATA.getRecords({
            app_name: APP_NAME,
            report_name: "Task_Report",
            criteria: parentCriteria,
            max_records: 1000,
          });

          console.log("Multiple task parents:", parentRes);

          const parents = parentRes?.code === 3000 ? parentRes.data : [];
          const parentById = new Map(parents.map((task) => [String(task.ID), task]));

          setMultipleTasks(
            slots
              .map((slot) => ({
                slot,
                parent: parentById.get(String(slot?.Task?.ID ?? slot?.Task ?? "")),
              }))
              .filter((pair) => pair.parent)
          );

        } catch (err) {
          console.log(err);
          setMultipleTasks([]);
        }
  }

    useEffect(() => {
        if (!USERID) return
        if (!formatDateToMMDDYYYY(currentDate)) return
    

        fetchTasks()
        fetchMultipleTasks()
    
    }, [USERID, currentDate])


  // ─────────────────────────────────────────────
  // RESOURCES (Employees)
  // ─────────────────────────────────────────────

const colors = ["#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c", "#e67e22", "#34495e"];
const [employees, setEmployees] = useState([]);
const [department, setDepartment] = useState([]);
const [allOrg, setAllOrg] = useState([])
const [allProjects, setAllProjects] = useState(projects)


const [filters, setFilters] = useState({
  department: "",
  organization: "",
  project:"",

});

const [taskFilters, setTaskFilters] = useState({
  project:"",
  employee:""

});

const updateFilter = (key, value) => {
  setFilters(prev => ({
    ...prev,
    [key]: value,
  }));
};

const updateTaskFilter = (key, value) => {
  setTaskFilters(prev => ({
    ...prev,
    [key]: value,
  }));

  
};

const fieldMap = {
  department: "Department",
  organization: "Organization",
  project:"Project_Name",
  employee: "Assignee"
};

const criteria = Object.entries(filters)
  .filter(([_, value]) => value) // Ignore empty filters
  .map(([key, value]) => `${fieldMap[key]}==${value}`)
  .join(" && ");

const defaultCriteria = `Task_Date='${formatDateToMMDDYYYY(currentDate)}' && Start_Time!=null`;

const dynamicCriteria = Object.entries(taskFilters)
  .filter(([_, value]) => value)
  .map(([key, value]) => `${fieldMap[key]}==${value}`)
  .join(" && ");

const task_criteria = dynamicCriteria ? `${defaultCriteria} && ${dynamicCriteria}` : defaultCriteria;

useEffect(() => {
      ZOHO.CREATOR.DATA.getRecords({report_name: "All_Departments"}).then((response) => {
        console.log("departments---",response);

        if (response.code === 3000) {
          setDepartment(response.data);
        }
      }).catch((err) => {
        console.error(err);

      });
},[])

useEffect(() => {
      ZOHO.CREATOR.DATA.getRecords({report_name: "All_Organizations"}).then((response) => {
        console.log("ORGs---",response);

        if (response.code === 3000) {
          setAllOrg(response.data);
        }
      }).catch((err) => {
        console.error(err);

      });
},[])


const handleFilter = () => {
  if(SUPER_ADMIN.includes(userEmail)){
      ZOHO.CREATOR.DATA.getRecords({report_name: "All_Employee", criteria: criteria}).then((response) => {
        console.log(response);

        if (response.code === 3000) {
          const teamEmp = response.data.map((emp, index) => ({
            resourceId: emp.ID || emp.id || `emp_${index}`,
            resourceTitle: emp.Name || emp.Name || `Employee ${index + 1}`,
            role: emp?.Role?.Role || "NA",
            avatar: "",
            email: emp.Email || "",
            color: colors[index % colors.length],
          }));
          setEmployees(teamEmp);
        }
      }).catch((err) => {
        console.error(err);

        setEmployees([
            { resourceId: "emp1", resourceTitle: "John Doe", role: "Software Engineer", avatar: "", color: "#3498db" },
            { resourceId: "emp2", resourceTitle: "Jane Smith", role: "UI Designer", avatar: "", color: "#e74c3c" },
            { resourceId: "emp3", resourceTitle: "Mike Johnson", role: "Manager", avatar: "", color: "#2ecc71" },
            { resourceId: "emp4", resourceTitle: "Sarah Williams", role: "QA Engineer", avatar: "", color: "#9b59b6" },
          ]);
      });

  }else{
    fetchTasks()
    
  }

}

useEffect(() => {
  if (AllEmployees?.length > 0) {
    const updated = AllEmployees.map((emp, index) => ({
      resourceId: emp.ID,
      resourceTitle: emp.Name,
      role: emp?.Role?.Role || "NA",
      avatar: "",
      email: emp.Email || "",
      color: colors[index % colors.length],
    }));
    setEmployees(updated);
    return;
  }

  ZOHO.CREATOR.DATA.getRecords({report_name: "My_Team_Employees",})
    .then((response) => {
      console.log(response);

      if (response.code === 3000) {
        const teamEmp = response.data.map((emp, index) => ({
          resourceId: emp.ID || emp.id || `emp_${index}`,
          resourceTitle: emp.Name || emp.Name || `Employee ${index + 1}`,
          role: emp?.Role?.Role || "NA",
          avatar: "",
          email: emp.Email || "",
          color: colors[index % colors.length],
        }));
        setEmployees(teamEmp);
      }
    }).catch((err) => {
      console.error(err);

      setEmployees([
          { resourceId: "emp1", resourceTitle: "John Doe", role: "Developer", avatar: "", color: "#3498db" },
          { resourceId: "emp2", resourceTitle: "Jane Smith", role: "Designer", avatar: "", color: "#e74c3c" },
          { resourceId: "emp3", resourceTitle: "Mike Johnson", role: "Manager", avatar: "", color: "#2ecc71" },
          { resourceId: "emp4", resourceTitle: "Sarah Williams", role: "QA Engineer", avatar: "", color: "#9b59b6" },
        ]);
    });
}, [AllEmployees]);

  const resources = useMemo(() => {

      return employees;
            
  }, [employees]);

  // Filtered resources based on selection
  const filteredResources = useMemo(() => {
    if (selectedResource === "all") return resources;
    return resources.filter((r) => r.resourceId === selectedResource);
  }, [resources, selectedResource]);

  // ─────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ─────────────────────────────────────────────
  function parseEventDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    const [month, day, year] = dateStr.split("-").map(Number);
    let [timePart, meridian] = timeStr.split(" ");
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (meridian?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridian?.toUpperCase() === "AM" && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

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

  function getResourceColor(resourceId) {
    const resource = resources.find((r) => r.resourceId === resourceId);
    return resource?.color || "#3174ad";
  }

  function isOverlapping(newEvent, events, ignoreEventId = null) {
    return events.some((event) => {
      if (ignoreEventId && event.id === ignoreEventId) return false;
      // Only check overlap within same resource
      if (event.resourceId !== newEvent.resourceId) return false;
      return newEvent.start < event.end && newEvent.end > event.start;
    });
  }

  // ─────────────────────────────────────────────
  // STYLING
  // ─────────────────────────────────────────────
  const eventStyleGetter = (event) => {


    return {

      className : `rbc-task ${event.priority} ${event.taskStatus === "Completed" ? "opacity-75" : ""}`
    };
  };

  

  // ─────────────────────────────────────────────
  // CUSTOM COMPONENTS
  // ─────────────────────────────────────────────
  const CustomEvent = ({ event }) => {
    const resource = resources.find((r) => r.resourceId === event.resourceId);
    return (
      <div className=" ms- ps- py- my-1">
        <div className="time" style={{ fontSize: "12px" }}>
          {format(event.start, "hh:mm a")} - {format(event.end, "hh:mm a")}
        </div>

        <div className="mt-1" style={{ fontWeight: "600", fontSize: "12px" }}>
          <i
            className={`bi bi-check2 me-1 ${
              event.taskStatus === "Completed" ? "" : "d-none"
            }`}
          ></i>
          {event.title}
        </div>
        {event.projectName && (
          <div
            className="text-uppercase mt-1 fw-medium"
            style={{ fontSize: "10px", opacity: 0.9 }}
          >
            {event.projectName}
          </div>
        )}
        {/* Show assignee name in week/day view without resources */}
        {currentView === "week" && resource && (
          <div
            className="mt-1"
            style={{
              fontSize: "10px",
              // opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: resource.color,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: "bold",
              }}
            >
              {resource.resourceTitle?.charAt(0)}
            </span>
            {resource.resourceTitle}
          </div>
        )}
      </div>
    );
  };

  // Custom Resource Header Component
  const ResourceHeader = ({ label, resource }) => {
    const initials = resource.resourceTitle
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 4px",
          minWidth: "120px",
        }}
      >
        

        {/* Name */}
        <div
          style={{
            fontWeight: "600",
            fontSize: "13px",
            textAlign: "center",
            color: "#2c3e50",
          }}
        >
          {resource.resourceTitle}
        </div>

        {/* Role */}
        {resource.role && (
          <div
            style={{
              fontSize: "10px",
              color: "#7f8c8d",
              textAlign: "center",
            }}
          >
            {resource.role}
          </div>
        )}


      </div>
    );
  };

  // ─────────────────────────────────────────────
  // API CALLS
  // ─────────────────────────────────────────────
  function addEvent(title, start, end, resourceId) {
    var config = {
      app_name: APP_NAME,
      form_name: "Task",
      payload: {
        data: {
          Task_Name: title,
          Start_Time: formatTimeToHHMM(start),
          End_Time: formatTimeToHHMM(end),
          Task_Date: formatDateToMMDDYYYY(start),
          Task_Status: "Not Started",
          Task_Priority: "Medium",
          Assignee: resourceId, // Now uses the resource/employee ID
        },
      },
    };
    ZOHO.CREATOR.DATA.addRecords(config)
      .then(function (response) {
        if (response.code == 3000) {
          console.log("Event added:", response);
        } else {
          console.log("Add event error:", response);
        }
      })
      .catch((e) => console.log(e));
  }

  function updateEvent(event, start, end, resourceId) {

    const reassigned = resourceId && resourceId !== event.resourceId;

    // A Multiple_Tasks slot lives in its own report — only its times move. The
    // assignee belongs to the parent task, so a reassignment is written there
    // (which moves the parent and all of its other slots with it).
    if (event.taskId) {

      var config = {
        app_name: APP_NAME,
        report_name: "All_Multiple_Tasks",
        id: event.id,
        payload: {
          data: {
            Start_Time: formatTimeToHHMM(start),
            End_Time: formatTimeToHHMM(end),
            Task_Date: formatDateToMMDDYYYY(start),
          },
        },
      };

      ZOHO.CREATOR.DATA.updateRecordById(config)
        .then(function (response) {
          if (response.code == 3000) {
            console.log("Multiple task slot updated:", response);
          } else {
            console.log("Update error:", response);
          }
        })
        .catch((e) => console.log(e));

      if (reassigned) {
        ZOHO.CREATOR.DATA.updateRecordById({
          app_name: APP_NAME,
          report_name: "Task_Report",
          id: event.taskId,
          payload: { data: { Assignee: resourceId } },
        })
          .then((response) => console.log("Parent task reassigned:", response))
          .catch((e) => console.log(e));
      }

      return;
    }

    const payload = {
      Start_Time: formatTimeToHHMM(start),
      End_Time: formatTimeToHHMM(end),
      Task_Date: formatDateToMMDDYYYY(start),
      Budgeted_Time: taskDuration(start,end)
    };

    // If resource changed (task reassigned to different employee)
    if (reassigned) {
      payload.Assignee = resourceId;
    }

    var config = {
      app_name: APP_NAME,
      report_name: "Task_Report",
      id: event.id,
      payload: { data: payload },
    };

    ZOHO.CREATOR.DATA.updateRecordById(config)
      .then(function (response) {
        if (response.code == 3000) {
          console.log("Event updated:", response);
        } else {
          console.log("Update error:", response);
        }
      })
      .catch((e) => console.log(e));
  }

  const [leaves, setLeaves] = useState([]);


// "08-24-2026" + "03:30:00 AM" -> Date object
const toDateTime = (dateStr, timeStr) => {
  const [m, d, y] = dateStr.split("-").map(Number);
  const { h, min, s } = parseTime(timeStr);
  return new Date(y, m - 1, d, h, min, s);
};

// "03:30:00 AM" -> { h: 3, min: 30, s: 0 } in 24-hour terms
const parseTime = (timeStr) => {
  const [clock, meridiem] = timeStr.trim().split(" ");
  let [h, min, s] = clock.split(":").map(Number);
  if (meridiem?.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridiem?.toUpperCase() === "AM" && h === 12) h = 0;
  return { h, min, s: s || 0 };
};

// returns { start, end } from the shift times + session
const getSessionTimes = (dateStr, session, shiftStart, shiftEnd) => {
  const start = toDateTime(dateStr, shiftStart);
  const end = toDateTime(dateStr, shiftEnd);
  const mid = new Date((start.getTime() + end.getTime()) / 2);

  switch (session) {
    case "First Half":
      return { start, end: mid };
    case "Second Half":
      return { start: mid, end };
    case "Full Day":
      return { start, end };
    default: // "Full Day"
      return { start, end };
  }
};

  useEffect(() => {

      async function fetchLeaves() {
        
        const config = {
          report_name: "My_Leaves",
          criteria: `Approval_status == "Approved" From <= '${objectToMM_DD_YYYY(currentDate)}' && To >= '${objectToMM_DD_YYYY(currentDate)}'`,
        };
    
        try {
          const response = await ZOHO.CREATOR.DATA.getRecords(config);

          console.log("Fetched Leaves...", response)
    
          if (response.code === 3000) {
            const newLeaves = response.data.flatMap(record =>
              record.Leave_Days_Details.map(day => {
                const { start, end } = getSessionTimes(
                  day.Date_field,
                  day.br,
                  record.Shift_Start_Time,
                  record.Shift_End_Time
                );
                return {
                  id: day.ID,
                  date: day.Date_field,
                  title: day.Leave_Type?.zc_display_value ?? day.Leave_Type,
                  start,
                  end,
                  priority: "leave",
                  projectName: "Leave",
                  session: day.br,
                  taskStatus: "Completed",
                  resourceId: record.Employee_Name?.ID || "unassigned",
                  assigneeName: record.Employee_Name?.Name || "",
                };
              })
            );
            setLeaves(newLeaves);
          }

        } catch (err) {
          console.error(err);
        }
      }

      fetchLeaves()


  },[USERID, currentDate])

  // ─────────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────────
  useEffect(() => {
    const newEvents = allTask
      .filter((eve) => eve?.Task_Date && eve?.Start_Time)
      .map((eve) => ({
        id: eve.ID,
        title: eve.Task_Name,
        start: parseEventDate(eve.Task_Date, eve.Start_Time),
        end: parseEventDate(eve.Task_Date, eve.End_Time),
        priority: eve.Task_Priority?.toLowerCase(),
        projectName: eve?.Project_Name?.Project_Name,
        taskStatus: eve?.Task_Status,
        // Map the assignee to resourceId
        resourceId: eve?.Assignee?.ID || eve?.Assignee || "unassigned",
        assigneeName: eve?.Assignee?.Name || eve?.Assignee_Name || "",
      }));

    // Each Multiple_Tasks record is an extra slot for a parent task: the parent's
    // title/project/assignee, but the slot's own date, time and record ID — so
    // dragging one moves only that slot.
    const multipleEvents = multipleTasks
      .filter(({ slot }) => slot?.Task_Date && slot?.Start_Time)
      .map(({ slot, parent }) => ({
        id: slot.ID,
        title: parent.Task_Name,
        start: parseEventDate(slot.Task_Date, slot.Start_Time),
        end: parseEventDate(slot.Task_Date, slot.End_Time),
        priority: "multiple",
        projectName: parent?.Project_Name?.Project_Name,
        taskStatus: parent?.Task_Status,
        multipleTask: true,
        taskId: parent.ID,
        resourceId: parent?.Assignee?.ID || parent?.Assignee || "unassigned",
        assigneeName: parent?.Assignee?.Name || parent?.Assignee_Name || "",
      }));

    setEvents([...newEvents, ...multipleEvents, ...leaves]);

    setUnscheduledTasks(
      allTask.filter((task) => !task.Start_Time && !task.End_Time)
    );
  }, [allTask, leaves, multipleTasks]);

  // ─────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────
  const handleEventDrop = useCallback(
    ({ event, start, end, resourceId }) => {

        console.log(event, start, end, resourceId)

      if (event.taskStatus === "Completed") return;

      const newResourceId = resourceId || event.resourceId;

      const updatedEvent = { ...event, start, end, resourceId: newResourceId };

      if (isOverlapping(updatedEvent, events, event.id)) {
        alert("This move overlaps with another event for this employee!");
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, start, end, resourceId: newResourceId }
            : e
        )
      );

      updateEvent(event, start, end, newResourceId);

      // Show reassignment notification
      if (newResourceId !== event.resourceId) {
        const fromResource = resources.find(
          (r) => r.resourceId === event.resourceId
        );
        const toResource = resources.find(
          (r) => r.resourceId === newResourceId
        );
        console.log(
          `Task "${event.title}" reassigned from ${fromResource?.resourceTitle} to ${toResource?.resourceTitle}`
        );
      }
    },
    [events, resources]
  );

  const handleEventResize = useCallback(
    ({ event, start, end }) => {
      if (event.taskStatus === "Completed") return;

      const resizedEvent = { ...event, start, end };

      if (isOverlapping(resizedEvent, events, event.id)) {
        alert("This resize overlaps with another event for this employee!");
        return;
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
      );

      updateEvent(event, start, end);
    },
    [events]
  );

  const handleSelectSlot = useCallback(
    ({ start, end, resourceId }) => {
      const newEvent = { start, end, resourceId: resourceId || "unassigned" };

      console.log(start, end, resourceId )

      setSelectedResourceID(resourceId)

      setStartEnd(newEvent);

      if (isOverlapping(newEvent, events)) {
        alert("This time slot overlaps with an existing event!");
        return;
      }

      const element = document.getElementById("addtaskoffcanvas");
      const bsOffcanvas = new window.bootstrap.Offcanvas(element);
      bsOffcanvas.show();
    },
    [events]
  );

  const handleSelectEvent = useCallback((event) => {
    console.log("Event clicked:", event);

    if(event.priority === "leave") return;

    const element = document.getElementById("offcanvasRight");
    const bsOffcanvas = new window.bootstrap.Offcanvas(element);
    bsOffcanvas.show();

    // Remember which Multiple_Tasks slot was clicked so the panel shows that
    // slot's date and time rather than the parent task's
    setEventID(event?.taskId ? event : null);

    var config = {
      app_name: APP_NAME,
      report_name: "Task_Report",
      id: event?.taskId ? event.taskId : event.id,
    };

    ZOHO.CREATOR.DATA.getRecordById(config)
      .then(function (response) {
        if (response.code === 3000) {
          setSelectedEvent(response.data);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  const handleUnScheduled = () => {
    const element = document.getElementById("unscheduledOffcanvass");
    const bsOffcanvas = new window.bootstrap.Offcanvas(element);
    bsOffcanvas.show();
  };

  // ─────────────────────────────────────────────
  // RESOURCE STATISTICS
  // ─────────────────────────────────────────────
  const getResourceStats = useCallback(
    (resourceId) => {
      const resourceEvents = events.filter(
        (e) => e.resourceId === resourceId
      );
      const totalTasks = resourceEvents.length;
      const completed = resourceEvents.filter(
        (e) => e.taskStatus === "Completed"
      ).length;
      const highPriority = resourceEvents.filter(
        (e) => e.priority === "high"
      ).length;

      // Calculate total hours
      const totalMinutes = resourceEvents.reduce((acc, e) => {
        return acc + (e.end - e.start) / (1000 * 60);
      }, 0);
      const totalHours = (totalMinutes / 60).toFixed(1);

      return { totalTasks, completed, highPriority, totalHours };
    },
    [events]
  );

  // Determine if we should show resources (day view)
  const showResources = currentView === "day";

  const [calStart, setCalStart] = useState(new Date(1970, 0, 1, 10, 0))
      const [calEnd, setCalEnd] = useState(new Date(1970, 0, 1, 23, 59))
  
      const [fullView, setFullView] = useState(false)
  
      const handle24HrsView = () => {
  
          if(!fullView){
              setCalStart(new Date(1970, 0, 1, 0, 0))
              setCalEnd(new Date(1970, 0, 1, 23, 59))
              setFullView(true)
          }else{
              setCalStart(new Date(1970, 0, 1, 10, 0))
              setCalEnd(new Date(1970, 0, 1, 23, 59))
              setFullView(false)
          }
          
      }
  
       const [open, setOpen] = useState(false);

useEffect(() => {
  const label = document.querySelector(".rbc-toolbar-label");
  if (!label) return;

  // Remove previous badge
  const existing = label.querySelector(".weekend-badge");
  if (existing) {
    existing.remove();
  }

  const isWeekend =
    currentDate.getDay() === 0 || currentDate.getDay() === 6;

  label.classList.toggle("weekend-label", isWeekend);

  if (isWeekend) {
    const badge = document.createElement("span");
    badge.className = "weekend-badge";
    badge.textContent = "Weekend";
    label.appendChild(badge);
  }
}, [currentDate]);

const [slotHeight, setSlotHeight] = useState(60);
const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="me-1" style={{ marginLeft: "80px" }}>

        <button className="position-absolute btn btn-sm" onClick={() => setShowHeader(prev => !prev)} style={{top:"0px", left:"30%"}}>
            <i className="bi bi-eye me-1"></i> {showHeader ? 'Hide' : 'Show'} Header
        </button>




      {showHeader && (

        <section>

           <div

        className="d-flex align-items-center justify-content-between px-3 py-2 mb-1"
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e9ecef",
        //   borderRadius: "8px",
        //   boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}

      >



        {/* Left: View Controls */}
        <div className="d-flex align-items-center gap-2">
          <span
            className="fw-bold text-secondary"
            style={{ fontSize: "14px" }}
          >
            <i className="bi bi-people-fill me-1"></i> Team Calendar
          </span>


        </div>

        {/* Center: Resource Filter */}
        <div className="d-flex align-items-center gap-2">
          <label
            className="text-muted me-1"
            style={{ fontSize: "13px", whiteSpace: "nowrap" }}
          >
            Filter Employee:
          </label>
          <select
            className="form-select form-select-sm"
            style={{ width: "200px" }}
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
          >
            <option value="all">All Employees</option>
            {resources.map((r) => (
              <option key={r.resourceId} value={r.resourceId}>
                {r.resourceTitle} ({r.role})
              </option>
            ))}
          </select>
        </div>


      </div>





      {/* ─────────── RESOURCE SUMMARY CARDS ─────────── */}
      <div className="d-flex gap-2 px-3 py-2 mb-1 overflow-auto scroll-karo-x">
        {(selectedResource === "all" ? resources : filteredResources).map(
          (resource) => {
            const stats = getResourceStats(resource.resourceId);
            return (
              <div
                key={resource.resourceId}
                className="card border-0 shadow-sm flex-shrink-0"
                style={{
                  minWidth: "180px",
                  borderTop: `3px solid ${resource.color}`,
                  cursor: "pointer",
                  backgroundColor:
                    selectedResource === resource.resourceId
                      ? "#f0f7ff"
                      : "#fff",
                }}
                onClick={() =>
                  setSelectedResource(
                    selectedResource === resource.resourceId
                      ? "all"
                      : resource.resourceId
                  )
                }
              >
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: resource.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      {resource.resourceTitle
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#2c3e50",
                        }}
                      >
                        {resource.resourceTitle}
                      </div>
                      <div style={{ fontSize: "10px", color: "#95a5a6" }}>
                        {resource.role}
                      </div>
                    </div>
                  </div>

                 
                </div>
              </div>
            );
          }
        )}
      </div>





</section>

      )}
   

      {/* ─────────── CALENDAR ─────────── */}
      <div style={{ "--slot-height":`${slotHeight}px`}}>
        <DndProvider backend={HTML5Backend}>
        <DnDCalendar
          localizer={localizer}
          events={
            selectedResource === "all"
              ? events
              : events.filter((e) => e.resourceId === selectedResource)
          }
          view={currentView}
          onView={setCurrentView}
          views={["day"]}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          style={{ height: "calc(100vh )", width: "100%" }}
          editable
          resizable
          selectable
          // ── Resource props (only for day view) ──
          {...(showResources && {
            resources: filteredResources,
            resourceIdAccessor: "resourceId",
            resourceTitleAccessor: "resourceTitle",
          })}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          eventPropGetter={eventStyleGetter}
          formats={{
            eventTimeRangeFormat: () => "",
          }}
          components={{
            event: CustomEvent,
            ...(showResources && {
              resourceHeader: ({ label, resource }) => (
                <ResourceHeader label={label} resource={resource} />
              ),
            }),
          }}
          min={calStart}   
          max={calEnd}
          onSelectEvent={handleSelectEvent}
          step={15}
          timeslots={4}
          dayLayoutAlgorithm="no-overlap"
        />
      </DndProvider>
      </div>

      {/* ─────────── OFFCANVAS COMPONENTS ─────────── */}
      <OffcanvasTaskDetails selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setEvents={setEvents} eventID={eventID} admin={true} />

      <AddTaskOffcanvas
        startEnd={startEnd}
        setEvents={setEvents}
        resourceID={selectedResourceID} // Pass resources so admin can assign
      />




      <div className="d-flex" style={{position: "fixed", right:"2%", top:"-2px", zIndex:"200"}}>

            {open && (
                <div className="border-secondary-subtle border rounded-bottom-4 bg-whit p-2 text-muted" style={{background:"#fcf8ff"}}>
                    
                     
                    <button className="btn text-muted fw-semibold" onClick={() => {setSlotHeight(40); setOpen(!open)}}><i class="bi bi-zoom-out me-2"></i> Small</button> <br />
                    <button className="btn text-muted fw-semibold" onClick={() => {setSlotHeight(60); setOpen(!open)}}><i class="bi bi-zoom-in me-2"></i> Medium</button> <br />
                    <button className="btn text-muted fw-semibold" onClick={() => {setSlotHeight(80); setOpen(!open)}}><i class="bi bi-zoom-in me-2"></i> Zoom</button> <br />
                    
                    
                </div>
            )}

            <div>
                <button className="btn action-btn btn-sm btn-black rounded-0" title="Zoom" onClick={() => setOpen(!open)}>
                  {open ? (<i class="bi bi-search-heart"></i>) : (<i class="bi bi-search-heart"></i>)}
                </button>
                <button className="btn action-btn btn-indigo btn-sm rounded-0" onClick={() => {handle24HrsView();  setOpen(false)}} title="24Hrs View"><i class="bi bi-clock-history"></i></button>
                <button className="btn action-btn btn-cyan btn-sm rounded-0" onClick={() => {setIsOpen(true); setOpen(false)}} title="Filter"><i class="bi bi-funnel-fill"></i></button>

            </div>

        </div>

<ToastContainer
  toasts={toasts}
  removeToast={removeToast}
/>


        {isOpen && (
          <div style={styles.overlay} onClick={()=> setIsOpen(false)}>
            <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
              <h4>Apply Filter</h4>


<div className="">

  {SUPER_ADMIN.includes(userEmail) && (

    <>

      <label className="form-label small">Organization</label>
      <select
        value={filters.organization}
        onChange={(e) => updateFilter("organization", e.target.value)}
        className="form-control mb-3 form-control-sm"
      >
        <option selected value="">Select ORG</option>
        {allOrg.map(e => (<option value={e?.ID}>{e?.Organization_Name || "NA"}</option>))}
        
      </select>

      <label className="form-label small">Department</label>
      <select
        value={filters.department}
        onChange={(e) => updateFilter("department", e.target.value)}
        className="form-control form-control-sm"
      >
        <option selected value="">Select Department</option>
        {department.map(e => (<option value={e?.ID}>{e?.Department_Name || "NA"}</option>))}
        
      </select>
    
    </>

  )}



  <label className="form-label small">Project</label>
  <select
    value={taskFilters.project}
    onChange={(e) => updateTaskFilter("project", e.target.value)}
    className="form-control form-control-sm mb-3"
  >
    <option selected value="">Select Project</option>
    {allProjects.map(e => (<option value={e?.ID}>{e?.Project_Name || "NA"}</option>))}
    
  </select>

  <label className="form-label small">Employee</label>
  <select
    value={taskFilters.employee}
    onChange={(e) => updateTaskFilter("employee", e.target.value)}
    // onChange={(e) => setSelectedResource(e.target.value)}
    className="form-control form-control-sm"
  >
    <option selected value="">Select Employee</option>
    {resources.map((r) => (
      <option key={r.resourceId} value={r.resourceId}>{r.resourceTitle}</option>
    ))}
    
  </select>

</div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  className="action-btn btn-brown btn-sm"
                  onClick={()=> {
                    setFilters({department: "", organization: "",})
                    setTaskFilters({  project:"", employee:""})
                  }}>Reset</button>

                <button
                  className="action-btn btn-blue btn-sm"
                  onClick={() => {
                    handleFilter()
                    setIsOpen(false);
                  }}
                >
                  Apply
                </button>
                
              </div>
            </div>
          </div>
        )}




    </div>
  );
};

export default AdminBigCalendar;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(34, 23, 75, 0.169)",
    backdropFilter: "blur(4px) saturate(110%)",
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