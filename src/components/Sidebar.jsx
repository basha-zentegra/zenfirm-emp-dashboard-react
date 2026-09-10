
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useUser } from '../context/UserContext';

const SUPER_USERS = ["roy@zentegra.com","praveen@zenfirm.app","basha@zentegra.com","abdul@zentegra.com","abdul@zenfirm.app",];

// ONE PLACE TO ADD / REORDER / RE-ICON A RAIL ITEM
const NAV_ITEMS = [
  { to: "/",            icon: "bi-house-door-fill",  label: "Home",        end: true },
  { to: "/calendar",    icon: "bi-calendar-week",     label: "ZenCalendar" },
  { to: "/attendance",  icon: "bi-airplane-fill",     label: "ZenLeave",    badge: "longLeave" },
  { to: "/kanban",      icon: "bi-kanban-fill",       label: "ZenBoards" },
  { to: "/superadmin",  icon: "bi-shield-lock-fill",  label: "Super Admin", superOnly: true },
];


const getInitials = (name = "") => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const Sidebar = ({ userEmail }) => {

  const { empName, thisMonthLongLeave = [] } = useUser();

  const superUser = SUPER_USERS.includes(userEmail);

  const items = NAV_ITEMS.filter((item) => !item.superOnly || superUser);

  // RE-RUNS WHEN superUser FLIPS, OTHERWISE THE ADMIN ICON RENDERS
  // AFTER THIS HAS ALREADY SCANNED THE DOM AND NEVER GETS A TOOLTIP
  useEffect(() => {
    const Tooltip = window.bootstrap?.Tooltip;
    if (!Tooltip) return;

    const tooltipList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
      .map((el) => Tooltip.getOrCreateInstance(el));

    return () => tooltipList.forEach((t) => t.dispose());
  }, [superUser, empName]);

  return (
    <div className="d-flex flex-column flex-shrink-0 py-3 vh-100 sidebar bg-white shadow-sm">

      <div className="sidebar-brand">
        <span>Zen</span><span className="text-zen fw-semibold">Firm</span>
      </div>

      <hr className="sidebar-divider" />

      <ul className="nav flex-column mb-auto w-100">
        {items.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              data-bs-title={item.label}
            >
              <i className={`bi ${item.icon} fs-5`}></i>

              {item.badge === "longLeave" && thisMonthLongLeave.length > 0 && (
                <span className="sidebar-dot" aria-label="Long leave this month"></span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* PROFILE — FILLS WHAT WAS AN EMPTY BOTTOM HALF */}
      <div className="sidebar-footer">
        <div
          className="sidebar-avatar"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-title={empName ? `${empName} · ${userEmail}` : userEmail}
        >
          {getInitials(empName)}
        </div>

        {/* <p className="sidebar-version">v{APP_VERSION}</p> */}
      </div>

    </div>
  )
}

export default Sidebar

// 1.1.3 - Un scheduled Tasks
// 1.1.4 - Super admin dashboard
// 1.1.5 - ITR & BTR dashboard
