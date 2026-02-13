import { useState, useEffect } from 'react';
import ITRChart from '../components/charts/ITRChart';
import ITRDashboard from '../components/charts/ITRDashboard';
import { Link,Outlet } from 'react-router-dom';

const ChartsPage = () => {

    return (
        <div className="me-3 mt-1" style={{marginLeft:"80px"}}>

            <nav className='d-flex align-items-center p-3 mb-2'>
                <h3 className='mb-0'>NMG Dashboards</h3>
                
                <div className="ms-4">

                    <Link className='btn btn-success btn-sm me-2' to="">ITR</Link>
                    <Link className='btn btn-primary btn-sm' to="btrdashboard">BTR</Link>
                </div>
               
            </nav>

            <Outlet />
            
        </div>
    );
};

export default ChartsPage;