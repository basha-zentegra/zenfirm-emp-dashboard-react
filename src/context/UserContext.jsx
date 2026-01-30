import { createContext, useContext, useEffect, useState } from "react";
import { APP_NAME } from "../config";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");
  const [USERID, setUserID] = useState("");
  const [projects, setProjects] = useState("");
  const [orgEmp, setOrgEmp] = useState([])

  useEffect(() => {
    ZOHO.CREATOR.UTIL.getInitParams()
      .then((response) => {
        setUserEmail(response?.loginUser || "");
      })
      .catch(console.error);
  }, []);



    useEffect(() => {
      if (!userEmail) return
  
      const config = {
        app_name: APP_NAME,
        report_name: "All_Employee",
        criteria: `Email=="${userEmail}"`
      }
  
      ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
          console.log("Employee Data:", response)
          setUserID(response.data[0].ID)
        })
        .catch((err) => console.error(err))
  
    }, [userEmail])

    useEffect(() => {
      if (!USERID) return
  
      const config = {
        app_name: APP_NAME,
        report_name: "My_Team_Projects",
        // criteria: `Associated_Members==${USERID}`
      }
  
      ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        console.log("My Associated Project:", response.data)
        setProjects(response.data)
      })
      .catch((err) => console.error(err))
  
    }, [USERID])


    useEffect(() => {
      const config = {
        app_name: APP_NAME,
        report_name: "org_emp",
      }
  
      ZOHO.CREATOR.DATA.getRecords(config).then((response) => {
        if(response.code === 3000){
          console.log("All Organization Employees:", response.data)
          setOrgEmp(response.data)
        } else{
          console.log(response)
        }
        
      })
      .catch((err) => console.error(err))
  
    }, [])

  return (
    <UserContext.Provider value={{ userEmail, USERID, projects, orgEmp }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook (best practice)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
};
