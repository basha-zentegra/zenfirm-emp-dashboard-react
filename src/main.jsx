import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from "./context/UserContext";
import { BrowserRouter,HashRouter } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  
    <UserProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </UserProvider>
,
)
