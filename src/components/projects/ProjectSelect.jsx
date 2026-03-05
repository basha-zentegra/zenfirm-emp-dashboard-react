import {useState} from 'react'
import AsyncSelect from 'react-select/async';


const loadOptions = async (inputValue) => {
  if (!inputValue) return [];
  if (inputValue.length < 3) {
    return []; // do nothing until 3 chars
  }

    const config = {
        report_name: "My_Team_Projects",
        max_records : 1000,
        criteria: `Project_Name.contains("${inputValue}")`
    }

    try {
        const response = await ZOHO.CREATOR.DATA.getRecords(config);

        // console.log("Project Select Response:", response.data);

        return response.data.map(e => ({
            label: e.Project_Name,
            value: e.ID
        }));

    } catch (err) {
        console.error(err);
        return [];
    }
};

const ProjectSelect = ({onProjectChange, selectedProject}) => {
    


    // const handleChange = (option) => {
    //     setSelectedProject(option);
    //     onProjectChange(option);
    // };

  return (

    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      value={selectedProject}
      placeholder="Search project..."
      onChange={onProjectChange}
      defaultOptions={false}
        noOptionsMessage={({ inputValue }) =>
            inputValue.length < 3
            ? "Type at least 3 characters to search"
            : "No projects found"
        }
        loadingMessage={() => "Searching projects..."}
    />

  )
}

export default ProjectSelect