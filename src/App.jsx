import { useState,useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import { useUser } from './context/UserContext'
import { APP_NAME } from './config'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import { Routes, Route } from 'react-router-dom'

function App() {


  const { userEmail, USERID } = useUser();



  return (
    <>

      <main className='' style={{overflow: "hidden"}}>

        <aside style={{ position: "fixed", width: "70px" }}>

          <Sidebar userEmail={userEmail}/>

        </aside>

        <section className='' style={{  overflowY: "auto" }}>


            

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              {/* <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} /> */}
            </Routes>


        </section>
      </main>



    </>
  )
}

export default App
