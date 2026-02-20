import {useState, useEffect, forwardRef, useImperativeHandle} from 'react'
import { useUser } from '../../context/UserContext'
import NewOffcanvass from './NewOffcanvass'

const KanbanSIdebar = forwardRef(({ setSelectedBoard }, ref) => {

    const [zenBoards, setZenBoards] = useState([])

    const [activeBoardId, setActiveBoardId] = useState(null)

    const handleClick = (board) => {
        setSelectedBoard(board)
        setActiveBoardId(board.ID)
        // console.log(project)
    }

    // ✅ Move fetchBoards here
    const fetchBoards = () => {
        ZOHO.CREATOR.DATA.getRecords({ report_name: "Zenboards_Report" })
            .then((response) => {
                console.log("Zenboard Report:", response.data);
                if (response.code === 3000) {
                    setZenBoards(response.data);
                }
            })
            .catch((err) => console.error(err));
    };

    // ✅ Now just call it inside useEffect
    useEffect(() => {
        fetchBoards();
    }, []);

    // 👇 expose function to parent
    useImperativeHandle(ref, () => ({
        fetchBoards
    }));

    const groupedBoards = zenBoards.reduce((acc, board) => {
        const category = board?.ZenBoard_Catagory?.Catagory || "Uncategorized";

        if (!acc[category]) {
            acc[category] = [];
        }

        acc[category].push(board);
        return acc;
    }, {});

    const handleNewKanbanOffcanvass = () => {

        const element = document.getElementById("NewKanbanOffcanvass");
        if(!element) return;
        const bsOffcanvas = new window.bootstrap.Offcanvas(element);
        bsOffcanvas.show();
    }


  return (
    <div className='m-3 me-1'>
        <h6 className='text-primary text-uppercase'>ZenBoard <i onClick={handleNewKanbanOffcanvass} class="bi bi-plus-square-fill cursor-pointer ms-2 shadow-lg"></i></h6>

        {Object.keys(groupedBoards).map((category) => (
            <div key={category} className="mb-3 border border-start-0 border-end-0 border-top-0">
                
                {/* Category Title */}
                <div className="fw-bold text-muted small text-uppercase mt-3">
                    {category}
                </div>

                {/* Boards Under Category */}
                {groupedBoards[category].map((element) => (
                    <div
                        key={element.ID}
                        className={`p-2  ${activeBoardId === element.ID ? 'bg-purple-light rounded-3' : ''}`}
                    >
                        <small
                            className='cursor-pointer fw-medium'
                            onClick={() => handleClick(element)}
                        >
                            {element?.Board_Name}
                        </small>
                    </div>
                ))}
            </div>
        ))}

        <NewOffcanvass fetchBoards={fetchBoards} />

    </div>
  )
});

export default KanbanSIdebar