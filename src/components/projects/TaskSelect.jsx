
import {useState, useEffect} from "react";
import AsyncSelect from "react-select/async";
import { useUser } from "../../context/UserContext";
import Select from "react-select";

const TaskSelect = ({ onTaskChange, selectedTask, selectedProject }) => {
  const { USERID } = useUser();

  const [taskOptions, setTaskOptions] = useState([]);


   const loadOptions = async () => {
    if (!selectedProject?.value) {
      setTaskOptions([]);
      return;
    }

    const config = {
      report_name: "Task_Report",
      max_records: 1000,
      criteria: `Assignee==${USERID} && Task_Status!="Completed" && Project_Name==${selectedProject.value}`,
    };

    try {
      const response = await ZOHO.CREATOR.DATA.getRecords(config);

      const tasks = (response.data || []).map((task) => ({
        label: task.Task_Name,
        value: task.ID,
      }));

      setTaskOptions(tasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setTaskOptions([]);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [selectedProject]);


  return (
    <Select
      options={taskOptions}
      value={selectedTask}
      onChange={onTaskChange}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          borderColor: state.isFocused ? "#754ffe95" : baseStyles.borderColor,
          boxShadow: state.isFocused ? "0 0 0 0.25rem #e3dcff" : "none",
          "&:hover": {
            borderColor: "none",
          },
        }),
      }}
    />
  );
};

export default TaskSelect;

