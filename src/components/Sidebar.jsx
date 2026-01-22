import React from 'react'

const Sidebar = ({userEmail}) => {
  return (
    <>
    
    <div
  className="d-flex flex-column flex-shrink-0 p-3  vh-100 shadow-lg"
  
>
  <a
    href="/"
    className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
  >
    <svg className="bi me-2" width="40" height="32">
      <use xlinkHref="#bootstrap" />
    </svg>
    <span className="fs-4">ZenFirm</span>
  </a>

  <hr />

  <ul className="nav nav-pills flex-column mb-auto">
    <li className="nav-item">
      <a href="#" className="nav-link active" aria-current="page">
        <i class="bi bi-house me-2"></i>
        Home
      </a>
    </li>
{/* 
    <li>
      <a href="#" className="nav-link link-dark">
        <i class="bi bi-journal-bookmark me-2"></i>
        My Projects
      </a>
    </li> */}

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
      {/* <img
        src="https://github.com/mdo.png"
        alt=""
        width="32"
        height="32"
        className="rounded-circle me-2"
      /> */}
      <span className='small fw-semibold'>{userEmail}</span>
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