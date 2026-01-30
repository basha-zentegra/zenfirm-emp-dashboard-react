import { useState,useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import { useUser } from './context/UserContext'
import { APP_NAME } from './config'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import { Routes, Route } from 'react-router-dom'
import Kanban from './pages/Kanban'
import Loading from './components/ui/Loading'
import { use } from 'react'

function App() {


  const { userEmail, USERID } = useUser();

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowLoading(false)
    }, 2200);
  })


  return (
    <>

{showLoading && <Loading/> }
 


{!showLoading && (
        <main className='' style={{overflow: "hidden"}}>

        <aside style={{ position: "fixed", width: "70px" }}>

          <Sidebar userEmail={userEmail}/>

        </aside>

        <section className='' style={{  overflowY: "auto" }}>


           

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/kanban" element={<Kanban />} />
              {/* <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} /> */}
            </Routes>


        </section>
      </main>
)}



    </>
  )
}

export default App
