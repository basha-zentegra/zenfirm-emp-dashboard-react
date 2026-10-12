import {useState, useEffect, useMemo} from 'react'
import { useUser } from '../../context/UserContext';
import { getDaysOld } from '../../utils/dateUtils';

// Age buckets for open tasks, oldest bucket last. `days` is how many days old
// Task_Date is; future-dated tasks come through negative and land in the first bucket.
const TASK_AGE_BUCKETS = [
  { key: "0-3",   label: "0-3 Days",   icon: "bi-lightning-charge-fill", bg: "bg-success-subtle", text: "text-success",  match: (days) => days <= 3 },
  { key: "3-7",   label: "3-7 Days",   icon: "bi-clock-fill",            bg: "bg-primary-subtle", text: "text-primary",  match: (days) => days > 3 && days <= 7 },
  { key: "7-15",  label: "7-15 Days",  icon: "bi-hourglass-split",       bg: "bg-warning-subtle", text: "text-warning",  match: (days) => days > 7 && days <= 15 },
  { key: "15-30", label: "15-30 Days", icon: "bi-exclamation-triangle-fill", bg: "bg-danger-subtle", text: "text-danger", match: (days) => days > 15 && days <= 30 },
  { key: "30+",   label: "30< Days",   icon: "bi-flag-fill",             bg: "bg-overdue-subtle", text: "text-overdue",  match: (days) => days > 30 },
];


const KanbanDefaultView = ({kanbanStats}) => {

    const {USERID} = useUser();

    const [openTasks, setOpenTasks] = useState([]);

    const [openTasksLoaded, setOpenTasksLoaded] = useState(false);

    async function fetchOpenTasks() {
        
        const config = {
          report_name: "Task_Report",
          criteria: `Assignee==${USERID} && Zenboards!=null && Kanban_Status!="Completed"`,
        };
    
        try {
          const response = await ZOHO.CREATOR.DATA.getRecords(config);

          console.log("Open Tasks..", response)
    
          setOpenTasks(response.code === 3000 ? response.data : [])
          setOpenTasksLoaded(true)

        } catch (err) {
          console.error(err);
          setOpenTasksLoaded(true)
        }
    }

    useEffect(() => {

        if (!USERID) return

        fetchOpenTasks()

    },[USERID])

    // Tally the open tasks into age buckets by Task_Date
    const taskAges = useMemo(() => {
        const counts = Object.fromEntries(TASK_AGE_BUCKETS.map(b => [b.key, 0]));
        let undated = 0;

        openTasks.forEach((task) => {
            const days = getDaysOld(task?.Task_Date);

            if (days === null) {
                undated += 1;
                return;
            }

            const bucket = TASK_AGE_BUCKETS.find(b => b.match(days));
            if (bucket) counts[bucket.key] += 1;
        });

        return { counts, undated };
    }, [openTasks]);


  return (
    <div className='text-center w-100 align-content-center px-4'>
        <img width="70px" className='mb-4' src="https://cdn-icons-png.flaticon.com/128/17952/17952229.png" alt="" />
        <h1 className='mb-4 lead'>Select the Board to Display the Kanban View</h1>

        <div className='row row-cols-1 row-cols-md-3 g-3 mx-auto mb-5' style={{ maxWidth: '760px' }}>

          {/* Total Boards */}
          <div className='col'>
            <div className='stat-card h-100 d-flex align-items-center bg-white p-3 shadow-sm rounded-4 text-start'>
              <div className='icon-box rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle' style={{ width: '50px', height: '50px' }}>
                <i className='bi bi-kanban fs-4 text-primary'></i>
              </div>
              <div className='ms-3'>
                <p className='text-uppercase small fw-semibold stat-card__label mb-0'>Total Boards</p>
                <h3 className='fs-4 fw-bold mb-0'>{kanbanStats?.totalBoards ?? "—"}</h3>
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div className='col'>
            <div className='stat-card h-100 d-flex align-items-center bg-white p-3 shadow-sm rounded-4 text-start'>
              <div className='icon-box rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle' style={{ width: '50px', height: '50px' }}>
                <i className='bi bi-clipboard-data fs-4 text-primary'></i>
              </div>
              <div className='ms-3'>
                <p className='text-uppercase small fw-semibold stat-card__label mb-0'>Total Tasks</p>
                <h3 className='fs-4 fw-bold mb-0'>{kanbanStats?.loaded ? kanbanStats.totalTasks : "—"}</h3>
              </div>
            </div>
          </div>

          {/* Open Tasks */}
          <div className='col'> 
            <div className='stat-card h-100 d-flex align-items-center bg-white p-3 shadow-sm rounded-4 text-start'>
              <div className='icon-box rounded-circle d-flex align-items-center justify-content-center bg-warning-subtle' style={{ width: '50px', height: '50px' }}>
                <i className='bi bi-hourglass-split fs-4 text-warning'></i>
              </div>
              <div className='ms-3'>
                <p className='text-uppercase small fw-semibold stat-card__label mb-0'>Open Tasks</p>
                <h3 className='fs-4 fw-bold mb-0'>{kanbanStats?.loaded ? kanbanStats.openTasks : "—"}</h3>
              </div>
            </div>
          </div>

        </div>

        <div className='mx-auto' style={{ maxWidth: '1100px' }}>

          <p className='text-uppercase small fw-semibold stat-card__label text-start mb-2'>
            My Open Tasks by Age
          </p>

          <div className='row row-cols-2 row-cols-md-3 row-cols-xl-5 g-3'>
            {TASK_AGE_BUCKETS.map((bucket) => (
              <div className='col' key={bucket.key}>
                <div className='stat-card h-100 d-flex align-items-center bg-white p-3 shadow-sm rounded-4 text-start'>
                  <div
                    className={`icon-box rounded-circle d-flex align-items-center justify-content-center ${bucket.bg}`}
                    style={{ width: '42px', height: '42px' }}
                  >
                    <i className={`bi ${bucket.icon} fs-5 ${bucket.text}`}></i>
                  </div>
                  <div className='ms-3'>
                    <p className='text-uppercase small fw-semibold stat-card__label mb-0'>{bucket.label}</p>
                    <h3 className='fs-4 fw-bold mb-0'>
                      {openTasksLoaded ? taskAges.counts[bucket.key] : "—"}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {openTasksLoaded && taskAges.undated > 0 && (
            <p className='small text-muted text-start mt-2 mb-0'>
              {taskAges.undated} open task{taskAges.undated === 1 ? "" : "s"} without a date {taskAges.undated === 1 ? "is" : "are"} not counted above.
            </p>
          )}

        </div>

    </div>
  )
}

export default KanbanDefaultView