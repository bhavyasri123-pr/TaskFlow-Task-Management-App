import { useEffect, useMemo, useState } from "react";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaCalendarAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaCamera,
  FaTrash,
  FaSave,
  FaKey
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

import "../styles/profile.css";

function Profile() {
  const [user, setUser] = useState({ name: "Loading...", email: "" });
  const [name, setName] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  });

  const completionRate =
    stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

  const avatarKey = useMemo(() => {
    return user.email ? `avatar_${user.email}` : "avatar_guest";
  }, [user.email]);

  const [avatar, setAvatar] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const key = savedUser?.email ? `avatar_${savedUser.email}` : "avatar_guest";
    return localStorage.getItem(key) || "";
  });

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  useEffect(() => {
    setAvatar(localStorage.getItem(avatarKey) || "");
  }, [avatarKey]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      if (res.data.success) {
        setUser(res.data.user);
        setName(res.data.user.name || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", { params: { all: true } });
      const tasks = res.data.tasks || [];

      setStats({
        total: tasks.length,
        completed: tasks.filter(task => task.status === "Completed").length,
        pending: tasks.filter(task => task.status === "Pending").length,
        inProgress: tasks.filter(task => task.status === "In Progress").length
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;
      localStorage.setItem(avatarKey, imageData);
      setAvatar(imageData);
      toast.success("Avatar uploaded");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAvatar = () => {
    localStorage.removeItem(avatarKey);
    setAvatar("");
    toast.success("Avatar removed");
  };

  const updateName = async (e) => {
    e.preventDefault();
    setSavingName(true);

    try {
      const res = await API.put("/auth/profile", { name });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);

    try {
      await API.put("/auth/change-password", passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: ""
      });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header-bg"></div>

            <div className="avatar-section">
              <div className="profile-avatar-preview">
                {avatar ? (
                  <img src={avatar} alt={user.name || "User avatar"} />
                ) : (
                  <FaUserCircle className="profile-icon" />
                )}

                <label className="avatar-camera-btn">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              {avatar && (
                <button
                  type="button"
                  className="avatar-remove-btn"
                  onClick={removeAvatar}
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>

            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="profile-role">Task Manager User</div>
          </div>

          <div className="profile-details">
            <h2>Personal Information</h2>

            <form className="profile-form" onSubmit={updateName}>
              <label>Change Name</label>

              <div className="profile-form-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <button type="submit" disabled={savingName}>
                  {savingName ? (
                    <Loader text="Saving..." compact />
                  ) : (
                    <>
                      <FaSave /> Save
                    </>
                  )}
                </button>
              </div>
            </form>

            <form className="profile-form" onSubmit={changePassword}>
              <label>Change Password</label>

              <div className="profile-password-grid">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })
                  }
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })
                  }
                />

                <button type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <Loader text="Saving..." compact />
                  ) : (
                    <>
                      <FaKey /> Change
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="info-row">
              <FaUser />
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>

            <div className="info-row">
              <FaEnvelope />
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="info-row">
              <FaBriefcase />
              <span>Role</span>
              <strong>User</strong>
            </div>

            <div className="info-row">
              <FaCalendarAlt />
              <span>Member Since</span>
              <strong>2026</strong>
            </div>
          </div>

          <div className="profile-stats">
            <h2>Task Statistics</h2>

            <div className="progress-wrapper">
              <div className="progress-header">
                <span>Completion Rate</span>
                <span>{completionRate}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="stats-box">
              <div className="stat total">
                <FaTasks />
                <h3>{stats.total}</h3>
                <p>Total Tasks</p>
              </div>

              <div className="stat completed">
                <FaCheckCircle />
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>

              <div className="stat pending">
                <FaClock />
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>

              <div className="stat progress">
                <FaClock />
                <h3>{stats.inProgress}</h3>
                <p>In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
