import { useState } from "react";
import {
  FaHome,
  FaTasks,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberEmail");
    navigate("/");
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {open && <div className="sidebar-backdrop" onClick={closeMenu} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo">
          <h2>TaskFlow</h2>
        </div>

        <nav>
          <NavLink to="/dashboard" onClick={closeMenu}>
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/tasks" onClick={closeMenu}>
            <FaTasks />
            <span>My Tasks</span>
          </NavLink>

          <NavLink to="/profile" onClick={closeMenu}>
            <FaUser />
            <span>Profile</span>
          </NavLink>

          <div className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
