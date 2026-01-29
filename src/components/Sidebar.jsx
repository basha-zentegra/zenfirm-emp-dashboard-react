
import { useState,useEffect } from 'react'
import { Link } from 'react-router-dom'

const Sidebar = ({userEmail}) => {

const [activeId, setActiveId] = useState(1);
  const handleClick = (id) =>{
    setActiveId(id);
  }

  // const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  // const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );

    const tooltipList = [...tooltipTriggerList].map(
      (el) => new bootstrap.Tooltip(el)
    );

    // ✅ cleanup on unmount
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, []); // 👈 run only once


  return (
    <>
    
    <div className="d-flex flex-column flex-shrink-0 p-3  vh-100 sidebar">
  <a
    href="/"
    className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
  >
    
    {/* <span className="fs-4">ZenFirm</span> */}
    <img style={{width:"50px"}} src="https://blogger.googleusercontent.com/img/a/AVvXsEhSNlyKoRigIvA0SewRbl6twztGq-Z1e-pYyb1NN8e4X47M-Qv2pf2ZPHELxIYBlQgrun3bIlRVdpRYhc3ymIhPHuuDdZNGXyGI-uwgYU7VUUra5NCybVlaBHKyJImCkDIgLGcx3LkYd-4VCcR_KnF5gEDcHTrW7wxEQ2skRrHsRqZodKLKVbBtrbucwvE" alt="" />
  </a>

  <hr />

  <ul className="nav nav-pills flex-column mb-auto">
    <li className="nav-item">
      <Link to="/" onClick={() => handleClick(1)} className="nav-link px-2 mb-3" aria-current="page" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Home">
        <i className={`bi bi-house fs-5 ${activeId === 1 ? "text-primary" : "text-dark"}`} ></i>
          
      </Link>
    </li>

    <li>
      <Link  to="/calendar" onClick={() => handleClick(2)} className="nav-link link-dark px-2 mb-3" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Calendar">
        {/* <i className="bi bi-journal-bookmark fs-5"></i> */}
        <i className={`bi bi-calendar-week fs-5 ${activeId === 2 ? "text-primary" : "text-dark"}`} ></i>
          
      </Link>
    </li>

    {/* <li>
      <a href="#" className="nav-link link-dark">
        <svg className="bi me-2" width="16" height="16">
          <use xlinkHref="#table" />
        </svg>
        Orders
      </a>
    </li>

    <li>
      <a href="#" className="nav-link link-dark">
        <svg className="bi me-2" width="16" height="16">
          <use xlinkHref="#grid" />
        </svg>
        Products
      </a>
    </li>

    <li>
      <a href="#" className="nav-link link-dark">
        <svg className="bi me-2" width="16" height="16">
          <use xlinkHref="#people-circle" />
        </svg>
        Customers
      </a>
    </li> */}
  </ul>

  <hr />

  <div className="dropdown">
    <a
      href="#"
      className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle text-center"
      id="dropdownUser2"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >

      {/* <span className='small fw-semibold'>{userEmail}</span> */}
      <i className="bi bi-person-circle fs-5"></i>
    </a>

    <ul
      className="dropdown-menu text-small shadow"
      aria-labelledby="dropdownUser2"
    >
      <li><a className="dropdown-item" href="#">Profile 1</a></li>
      <li><a className="dropdown-item" href="#">Profile 2</a></li>
      <li><a className="dropdown-item" href="#">Profile 3</a></li>
      <li><hr className="dropdown-divider" /></li>
      <li><a className="dropdown-item" href="#">Current</a></li>
    </ul>
  </div>
</div>

    
    
    </>
  )
}

export default Sidebar