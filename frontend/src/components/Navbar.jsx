import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import "../styles/navbar.css";

function Navbar() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
  };


  const user =
    JSON.parse(localStorage.getItem("user"));

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="navbar">

      <div>

        <h2>{greeting}</h2>

        <p>
          Welcome back, {user?.name || "User"}
        </p>

      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <ProfileMenu />
      </div>

    </div>
  );
}

export default Navbar;