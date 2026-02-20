import { useState,useEffect } from "react";
import Select from "react-select";
import { useUser } from "../../context/UserContext";

const ZenBoardForm = ({fetchBoards}) => {

    const {orgEmp} = useUser();

    const [categories, setCatagoriees] = useState([]);

    const memberOptions = orgEmp ? orgEmp.map(e => ({value: e?.ID,label: e?.Name})) : [];
    

    const [formData, setFormData] = useState({
        ZenBoard_Catagory: "",
        Board_Name: "",
        Associate_Members: [],
        Zenboard_Status: ""
    });


    useEffect(() => {
        ZOHO.CREATOR.DATA.getRecords({report_name: "ZenBoard_Catagory_Report"}).then((response) => {
            console.log("Zenboard Category Report:", response.data)
            if(response.code === 3000){
                setCatagoriees(response.data)
            }
        })
        .catch((err) => console.error(err))
    
    }, [])



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log(formData)
    };

    function addBoard() {
        var config = {
            form_name: "Zenboards",
            payload: {data: formData}
        };
        // console.log(taskData)
        ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
            if (response.code == 3000) {
                
                setFormData({
                    ZenBoard_Catagory: "",
                    Board_Name: "",
                    Associate_Members: [],
                    Zenboard_Status: ""
                })

                fetchBoards()

    
            } else{
                console.log(response);
            }
        }).catch(e => console.log(e))
    }



    const handleSubmit = (e) => {
        e.preventDefault();
        // fetchBoards(); // refresh sidebar
        addBoard()
        console.log("Form Data:", formData);
    };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <div className='text-end' style={{position:"absolute", top:"15px", right:"15px"}}>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>

      </div>
        <h5 className="mb-3">Create ZenBoard</h5>
        {/* <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button> */}

        <form onSubmit={handleSubmit}>

          {/* Zenboard Category */}
          <div className="mb-3">
            <label className="form-label"><i class="bi bi-tags"></i> Zenboard Category</label>
            <select
              className="form-select"
              name="ZenBoard_Catagory"
              value={formData.ZenBoard_Catagory}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat?.ID}>
                  {cat?.Catagory}
                </option>
              ))}
            </select>
          </div>

          {/* Board Name */}
          <div className="mb-3">
            <label className="form-label"><i class="bi bi-kanban"></i> Board Name</label>
            <input
              type="text"
              className="form-control"
              name="Board_Name"
              placeholder="Enter board name"
              value={formData.Board_Name}
              onChange={handleChange}
            />
          </div>

          {/* Associated Members */}
          <div className="mb-3">
            <label className="form-label"><i class="bi bi-people"></i> Associated Members</label>
            <Select
                options={memberOptions}
                isMulti
                value={memberOptions.filter(option => formData.Associate_Members.includes(option.value))}
                onChange={(selected) => setFormData({...formData,Associate_Members: selected ? selected.map(opt => opt.value) : []})}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select members..."
            />
          </div>


          {/* Zenboard Status */}
          <div className="mb-3">
            <label className="form-label"><i class="bi bi-list-nested"></i> Zenboard Status</label>
            <textarea
              className="form-control"
              rows="3"
              name="Zenboard_Status"
              placeholder="Comma sepratted value..."
              value={formData.Zenboard_Status}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">
            Create Board
          </button>


        </form>
      </div>
    </div>
  );
};

export default ZenBoardForm;
