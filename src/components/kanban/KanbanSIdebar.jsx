import {useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle} from 'react'
import { useUser } from '../../context/UserContext'
import NewOffcanvass from './NewOffcanvass'
import '../../css/kanban.css'

const KanbanSIdebar = forwardRef(({ setSelectedBoard, boardMembers, onFilter, selectedBoardTaskCount, onStats }, ref) => {

    const [zenBoards, setZenBoards] = useState([])

    // One compact row per board task — { board, assignee, done } — tallied locally so
    // switching the employee filter costs no extra API calls
    const [boardTaskRows, setBoardTaskRows] = useState([])

    const [countsLoaded, setCountsLoaded] = useState(false)

    const countsRequestRef = useRef(0)

    const [activeBoardId, setActiveBoardId] = useState(null)

    const [editZenBoard, setEditZenBoard] = useState(null)

    const [showFilter, setShowFilter] = useState(false)

    const handleClick = (board) => {
        setSelectedBoard(board)
        setActiveBoardId(board.ID)
        // console.log(project)
    }

    const {AllEmployees=[], orgEmp=[]} = useUser();

    const [filterEmp, setFilterEmp] = useState([]);

    const [empFilter, setEmpFilter] = useState("all");

    const handleEmpFilter = (value) => {
        setEmpFilter(value)
        onFilter(value)
    }

    useEffect(()=>{

      setFilterEmp(AllEmployees || orgEmp || [] )

    },[AllEmployees,orgEmp])

    // Page through a report. One request covers every board in the common case;
    // MAX_PAGES and the repeated-page check keep this bounded if the SDK ignores `page`.
    const PAGE_SIZE = 1000;
    const MAX_PAGES = 10;

    const fetchAllRecords = async (criteria) => {
        const all = [];
        let page = 1;
        let previousFirstId = null;

        while (page <= MAX_PAGES) {
            const response = await ZOHO.CREATOR.DATA.getRecords({
                report_name: "Task_Report",
                criteria,
                max_records: PAGE_SIZE,
                page,
            }).catch(() => null);

            if (response?.code !== 3000 || !response?.data?.length) break;

            const firstId = response.data[0]?.ID;
            if (firstId && firstId === previousFirstId) break; // same page again — stop
            previousFirstId = firstId;

            all.push(...response.data);

            if (response.data.length < PAGE_SIZE) break;
            page += 1;
        }

        return all;
    };

    // Pull every board's tasks in a single request and keep only what the counts need.
    // Previously this fired two getRecordCount calls per board, which tripped Zoho's
    // rate limit once there were more than a handful of boards.
    const fetchTaskCounts = async (boards) => {
        if (!boards?.length) {
            setBoardTaskRows([]);
            setCountsLoaded(false);
            return;
        }

        const requestId = ++countsRequestRef.current;

        const criteria = `(${boards.map((b) => `Zenboards.ID==${b.ID}`).join(" || ")})`;

        const records = await fetchAllRecords(criteria);

        // A newer fetch started while this one was in flight — drop this result
        if (requestId !== countsRequestRef.current) return;

        setBoardTaskRows(records.map((task) => ({
            board: task?.Zenboards?.ID,
            assignee: task?.Assignee?.ID ? String(task.Assignee.ID) : null,
            done: task?.Task_Status === "Completed",
        })));
        setCountsLoaded(true);
    };

    // Counts per board for the current employee filter — derived, never refetched
    const boardTaskCounts = useMemo(() => {
        const counts = {};

        boardTaskRows.forEach((row) => {
            if (!row.board) return;
            if (empFilter !== "all" && row.assignee !== empFilter) return;

            if (!counts[row.board]) counts[row.board] = { total: 0, open: 0 };

            counts[row.board].total += 1;
            if (!row.done) counts[row.board].open += 1;
        });

        return counts;
    }, [boardTaskRows, empFilter]);

    // ✅ Move fetchBoards here
    const fetchBoards = () => {
        ZOHO.CREATOR.DATA.getRecords({ report_name: "Zenboards_Report" })
            .then((response) => {
                console.log("Zenboard Report:", response.data);
                if (response.code === 3000) {
                    setZenBoards(response.data);
                    setSelectedBoard(prev =>
                        response.data.find(e => e.ID === prev?.ID) || null
                    );
                }
            })
            .catch((err) => console.error(err));
    };

    // ✅ Now just call it inside useEffect
    useEffect(() => {
        fetchBoards();
    }, []);

    // Only refetch when the boards themselves reload — the employee filter is
    // applied locally over the rows we already hold
    useEffect(() => {
        fetchTaskCounts(zenBoards);
    }, [zenBoards]);

    // Roll the per-board counts up for the KPI cards on the parent's empty state
    useEffect(() => {
        const counts = Object.values(boardTaskCounts);

        onStats?.({
            totalBoards: zenBoards.length,
            totalTasks: counts.reduce((sum, c) => sum + c.total, 0),
            openTasks: counts.reduce((sum, c) => sum + c.open, 0),
            loaded: countsLoaded,
        });
    }, [boardTaskCounts, zenBoards, countsLoaded]);

    // 👇 expose function to parent
    useImperativeHandle(ref, () => ({
        fetchBoards,
        refreshTaskCounts: () => fetchTaskCounts(zenBoards)
    }));

    const groupedBoards = zenBoards.reduce((acc, board) => {
        const category = board?.ZenBoard_Catagory?.Catagory || "Uncategorized";

        if (!acc[category]) {
            acc[category] = [];
        }

        acc[category].push(board);
        return acc;
    }, {});

    const handleNewKanbanOffcanvass = (edit=null) => {

        const element = document.getElementById("NewKanbanOffcanvass");
        if(!element) return;
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();

        if(edit) console.log(edit)
        setEditZenBoard(edit)
    }

    const [openCategories, setOpenCategories] = useState({});

    const toggleCategory = (category) => {
        setOpenCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

  return (
    <div className='m-3 me-1'>
        <div className='zen-sidebar-head'>
          <div className='zen-sidebar-title'>
            <i className='bi bi-kanban'></i>
            <span>ZenBoard</span>
            <span className='zen-sidebar-count'>{zenBoards.length}</span>
          </div>

          <div className='zen-sidebar-actions'>
            <button
              type='button'
              className='zen-icon-btn'
              title='New board'
              onClick={() => handleNewKanbanOffcanvass()}
            >
              <i className='bi bi-plus-lg'></i>
            </button>

            <button
              type='button'
              className={`zen-icon-btn ${showFilter || empFilter !== "all" ? "is-active" : ""}`}
              title={empFilter === "all" ? "Filter by employee" : "Filtered by employee"}
              onClick={() => setShowFilter(p => !p)}
            >
              <i className='bi bi-funnel-fill'></i>
            </button>
          </div>
        </div>

        {showFilter && (
          <div className='zen-filter'>
            <select
              className='form-select form-select-sm'
              value={empFilter}
              onChange={(e) => handleEmpFilter(e.target.value)}
            >
              <option value="all">All employees</option>
              {filterEmp.map(e => (<option key={e.ID} value={e.ID}>{e.Name}</option>))}
            </select>

            {empFilter !== "all" && (
              <button
                type='button'
                className='zen-icon-btn'
                title='Clear filter'
                onClick={() => handleEmpFilter("all")}
              >
                <i className='bi bi-x-lg'></i>
              </button>
            )}
          </div>
        )}

        {Object.keys(groupedBoards).map((category) => {
        const isOpen = openCategories[category];

  return (
    <div key={category} className="mb-2">
      {/* Category Header */}
      <div
        className={`zen-category ${isOpen ? "is-open" : ""}`}
        onClick={() => toggleCategory(category)}
        title={category}
      >
        <span className="zen-category__name">{category}</span>
        <i className="bi bi-chevron-right zen-category__chevron"></i>
      </div>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all ${
          isOpen ? "mt-2" : ""
        }`}
        style={{
          maxHeight: isOpen ? "500px" : "0px",
          transition: "max-height 0.3s ease",
        }}
      >
        {groupedBoards[category].map((element) => {
          // The open board reads its count straight from the loaded tasks so it stays
          // live while tasks are added, but falls back to the fetched count so it
          // doesn't flash 0 during the reload after switching boards.
          const taskCount = activeBoardId === element.ID && selectedBoardTaskCount
            ? selectedBoardTaskCount
            : boardTaskCounts[element.ID]?.open;

        return (
          <div
            key={element.ID}
            className={`zen-board-row p-2 d-flex justify-content-between align-items-center gap-2 ${
              activeBoardId === element.ID
                ? "bg-purple-light rounded-3"
                : ""
            }`}
          >
            <span
              className="cursor-pointer fw-medium"
              onClick={() => handleClick(element)}
            >
              {element?.Board_Name} {activeBoardId === element.ID ? (<i onClick={() => handleNewKanbanOffcanvass(element)} class="bi bi-pencil-fill cursor-pointer ms-2 small"></i>) : ""} 
            </span>
            <span
              className="badge rounded-pill bg-light text-muted border flex-shrink-0"
              title={`${taskCount ?? 0} open task${taskCount === 1 ? "" : "s"}`}
            >
              {taskCount ?? "0"}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
})}

        <NewOffcanvass fetchBoards={fetchBoards} isEdit={editZenBoard} setEditZenBoard={setEditZenBoard} />

    </div>
  )
});

export default KanbanSIdebar
// thisapp.ZenBoard.ZenBoardsFilter()