import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

import "../styles/profilemenu.css";

function ProfileMenu() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const avatar = user?.email
    ? localStorage.getItem(`avatar_${user.email}`)
    : "";

  const logout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
      setOpen(false);
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberEmail");

    navigate("/login");
  };

  return (
    <div className="profile-menu">

      <div
        className="profile-btn"
        onClick={() => setOpen(!open)}
      >

        <div className="avatar">
          {avatar ? (
            <img src={avatar} alt={user?.name || "User avatar"} />
          ) : (
            user?.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <div className="profile-info">

          <span className="username">
            {user?.name || "User"}
          </span>

          <span className="email">
            {user?.email || ""}
          </span>

        </div>

        <FaChevronDown />

      </div>

      {open && (

        <div className="dropdown">

          <button
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            <FaUser />
            My Profile
          </button>

          <button
            className="logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      )}

    </div>
  );
}

export default ProfileMenu;