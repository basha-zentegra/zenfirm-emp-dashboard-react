import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { APP_NAME } from "../../config";
import OffcanvasTaskDetails from "./OffcanvasTaskDetails";
import AddTaskOffcanvas from "./AddTaskOffcanvas";
import UnScheduledTasks from "./UnScheduledTasks";

import { useUser } from "../../context/UserContext";

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

    const {orgEmp, USERID,userEmail,AllEmployees} = useUser();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startEnd, setStartEnd] = useState({});
  const [currentView, setCurrentView] = useState("day"); // day view works best with resources
  const [selectedResource, setSelectedResource] = useState("all"); // filter

  const [showHeader, setShowHeader] = useState(false)

    const [allTask, setAllTask] = useState([]);

  const [selectedResourceID, setSelectedResourceID] = useState(null);


    useEffect(() => {
        if (!USERID) return
    
        const config = {
          app_name: APP_NAME,
          report_name: "Task_Report",
          criteria: `Task_Date!=null && Start_Time!=null`,
          max_records : 1000,
          // sort_by: "Task_Date",     // field name
          // sort_order: "dsc"
          
        }
    
        ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
    
            if(response.code === 3000){
              console.log("My All Tasks for Calendar:", response.data)
              const taskRes = response.data;

                setAllTask(taskRes)
              
            }
            
        }).catch((err) => console.error(err))
    
    }, [USERID])

  let allEmployees = AllEmployees || orgEmp || [];

  // ─────────────────────────────────────────────
  // RESOURCES (Employees)
  // ─────────────────────────────────────────────

  const resources = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) {
      // Fallback demo resources
      return [
        { resourceId: "emp1", resourceTitle: "John Doe", role: "Developer", avatar: "", color: "#3498db" },
        { resourceId: "emp2", resourceTitle: "Jane Smith", role: "Designer", avatar: "", color: "#e74c3c" },
        { resourceId: "emp3", resourceTitle: "Mike Johnson", role: "Manager", avatar: "", color: "#2ecc71" },
        { resourceId: "emp4", resourceTitle: "Sarah Williams", role: "QA Engineer", avatar: "", color: "#9b59b6" },
      ];
    }

    const colors = ["#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c", "#e67e22", "#34495e"];
    return allEmployees.map((emp, index) => ({
      resourceId: emp.ID || emp.id || `emp_${index}`,
      resourceTitle: emp.Name || emp.Name || `Employee ${index + 1}`,
      role: "NA",
      avatar: "",
      email: emp.Email || "",
      color: colors[index % colors.length],
    }));
  }, [allEmployees]);

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
    let backgroundColor = "#3174ad";

    switch (event.priority) {
      case "high":
        backgroundColor = "#e74c3c";
        break;
      case "medium":
        backgroundColor = "#f39c12";
        break;
      case "low":
        backgroundColor = "#2ecc71";
        break;
      default:
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        color: "white",
        border: `none`,
        padding: "2px 6px",
        opacity: event.taskStatus === "Completed" ? 0.5 : 0.9,
        fontSize: "12px",
      },
    };
  };

  // ─────────────────────────────────────────────
  // CUSTOM COMPONENTS
  // ─────────────────────────────────────────────
  const CustomEvent = ({ event }) => {
    const resource = resources.find((r) => r.resourceId === event.resourceId);
    return (
      <div>
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
            style={{ fontSize: "10px", opacity: 0.8 }}
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
              opacity: 0.9,
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
        {/* Avatar */}
        {/* <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: resource.color || "#3174ad",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "4px",
            overflow: "hidden",
          }}
        >
          {resource.avatar ? (
            <img
              src={resource.avatar}
              alt={resource.resourceTitle}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div> */}

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

        {/* Task count badge */}
        {/* <span
          className="badge mt-1"
          style={{
            // backgroundColor: resource.color,
            fontSize: "10px",
          }}
        >
          {events.filter((e) => e.resourceId === resource.resourceId).length} tasks
        </span> */}
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
    const payload = {
      Start_Time: formatTimeToHHMM(start),
      End_Time: formatTimeToHHMM(end),
      Task_Date: formatDateToMMDDYYYY(start),
    };

    // If resource changed (task reassigned to different employee)
    if (resourceId && resourceId !== event.resourceId) {
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

  // ─────────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (allTask.length > 0) {
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

      setEvents(newEvents);

      const newUnscheduled = allTask.filter(
        (task) => !task.Start_Time && !task.End_Time
      );
      setUnscheduledTasks(newUnscheduled);
    }
  }, [allTask]);

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

    const element = document.getElementById("offcanvasRight");
    const bsOffcanvas = new window.bootstrap.Offcanvas(element);
    bsOffcanvas.show();

    var config = {
      app_name: APP_NAME,
      report_name: "Task_Report",
      id: event.id,
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

          {/* <div className="btn-group btn-group-sm ms-3" role="group">
            <button
              className={`btn ${
                currentView === "day"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentView("day")}
            >
              <i className="bi bi-calendar-day me-1"></i>Day
            </button>
            <button
              className={`btn ${
                currentView === "week"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentView("week")}
            >
              <i className="bi bi-calendar-week me-1"></i>Week
            </button>
          </div> */}
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

        {/* Right: Actions */}
        {/* <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleUnScheduled}
          >
            <i className="bi bi-hourglass-top me-1"></i>
            Unscheduled
            {unscheduledTasks.length > 0 && (
              <span className="badge bg-danger ms-1">
                {unscheduledTasks.length}
              </span>
            )}
          </button>
        </div> */}
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

                  {/* <div className="d-flex justify-content-between mt-1">
                    <span
                      style={{ fontSize: "10px" }}
                      className="text-muted"
                    >
                      <i className="bi bi-list-task me-1"></i>
                      {stats.totalTasks} tasks
                    </span>
                    <span
                      style={{ fontSize: "10px" }}
                      className="text-muted"
                    >
                      <i className="bi bi-clock me-1"></i>
                      {stats.totalHours}h
                    </span>
                    {stats.highPriority > 0 && (
                      <span
                        style={{ fontSize: "10px" }}
                        className="text-danger"
                      >
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {stats.highPriority}
                      </span>
                    )}
                  </div> */}

                  {/* Progress bar */}
                  {/* <div
                    className="progress mt-1"
                    style={{ height: "3px" }}
                  >
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${
                          stats.totalTasks > 0
                            ? (stats.completed / stats.totalTasks) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div> */}
                </div>
              </div>
            );
          }
        )}
      </div>



</section>

      )}
   

      {/* ─────────── CALENDAR ─────────── */}
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
          views={["day", "week"]}
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
          components={{
            event: CustomEvent,
            ...(showResources && {
              resourceHeader: ({ label, resource }) => (
                <ResourceHeader label={label} resource={resource} />
              ),
            }),
          }}
          min={new Date(1970, 0, 1, 11, 0)}
          max={new Date(1970, 0, 1, 23, 59)}
          onSelectEvent={handleSelectEvent}
          step={15}
          timeslots={4}
          dayLayoutAlgorithm="no-overlap"
        />
      </DndProvider>

      {/* ─────────── OFFCANVAS COMPONENTS ─────────── */}
      <OffcanvasTaskDetails selectedEvent={selectedEvent} admin={true} />

      <AddTaskOffcanvas
        startEnd={startEnd}
        setEvents={setEvents}
        resourceID={selectedResourceID} // Pass resources so admin can assign
      />

      {/* <UnScheduledTasks
        setEvents={setEvents}
        resources={resources} 
      /> */}
    </div>
  );
};

export default AdminBigCalendar;