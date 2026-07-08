import { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import DeleteModal from "../components/DeleteModal";
import Loader from "../components/Loader";
import TaskChart from "../components/TaskChart";
import API from "../services/api";
import socket from "../services/socket";

import "../styles/dashboard.css";
import "../styles/taskcard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    socket.connect();

    const refresh = () => fetchTasks();
    socket.on("task_created", refresh);
    socket.on("task_updated", refresh);
    socket.on("task_deleted", refresh);

    return () => {
      socket.off("task_created", refresh);
      socket.off("task_updated", refresh);
      socket.off("task_deleted", refresh);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", { params: { all: true } });
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskQuick = async (task, changes) => {
    const payload = {
      ...task,
      pinned: task.pinned ? 1 : 0,
      favorite: task.favorite ? 1 : 0,
      reminder_at: task.reminder_at || null,
      attachment_name: task.attachment_name || null,
      ...changes
    };

    await API.put(`/tasks/${task.id}`, payload);
    fetchTasks();
  };

  const getLocalDate = (dateValue) => {
    if (!dateValue) return null;
    const dateText = String(dateValue).slice(0, 10);
    const date = new Date(`${dateText}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getDayDifference = (dateValue) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = getLocalDate(dateValue);

    if (!dueDate) return null;

    return Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const overdueTasks = tasks.filter((task) => {
    const diff = getDayDifference(task.due_date);
    return task.status !== "Completed" && diff !== null && diff < 0;
  }).length;

  const upcomingReminders = useMemo(() => {
    return tasks
      .filter((task) => task.status !== "Completed")
      .map((task) => {
        const diff = getDayDifference(task.due_date);
        let label = "Upcoming";
        let tone = "upcoming";

        if (diff === 0) {
          label = "Due Today";
          tone = "today";
        } else if (diff === 1) {
          label = "Due Tomorrow";
          tone = "tomorrow";
        } else if (diff !== null && diff < 0) {
          label = "Overdue";
          tone = "overdue";
        } else if (diff !== null) {
          label = `${diff} days left`;
        }

        return { ...task, diff, label, tone };
      })
      .filter((task) => task.diff !== null && task.diff <= 1)
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 5);
  }, [tasks]);

  useEffect(() => {
    if (loading || upcomingReminders.length === 0 || !("Notification" in window)) {
      return;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const notifyTasks = upcomingReminders.filter((task) => task.diff === 0 || task.diff === 1);

    const showNotification = (task) => {
      const notificationKey = `task-reminder-${task.id}-${todayKey}`;

      if (sessionStorage.getItem(notificationKey)) {
        return;
      }

      new Notification("Task Reminder", {
        body: `${task.title} is ${task.diff === 0 ? "due today" : "due tomorrow"}.`,
      });

      sessionStorage.setItem(notificationKey, "shown");
    };

    if (Notification.permission === "granted") {
      notifyTasks.forEach(showNotification);
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          notifyTasks.forEach(showNotification);
        }
      });
    }
  }, [loading, upcomingReminders]);

  const focusTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        if ((b.pinned || 0) !== (a.pinned || 0)) return (b.pinned || 0) - (a.pinned || 0);
        if ((b.favorite || 0) !== (a.favorite || 0)) return (b.favorite || 0) - (a.favorite || 0);
        return new Date(a.due_date) - new Date(b.due_date);
      })
      .slice(0, 6);
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monday = new Date(today);
    const dayIndex = monday.getDay();
    monday.setDate(today.getDate() + (dayIndex === 0 ? -6 : 1 - dayIndex));

    const days = labels.map((label, index) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + index);

      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      return {
        label,
        start,
        end,
        dateLabel: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      };
    });

    const counts = days.map((day) => {
      return tasks.filter((task) => {
        if (task.status !== "Completed") return false;

        const completedDate = new Date(task.completed_at || task.updated_at || task.created_at || task.due_date);
        if (Number.isNaN(completedDate.getTime())) return false;

        return completedDate >= day.start && completedDate < day.end;
      }).length;
    });

    const max = Math.max(1, ...counts);

    return days.map((day, index) => ({
      ...day,
      count: counts[index],
      height: counts[index] === 0 ? 8 : Math.max(24, (counts[index] / max) * 120),
    }));
  }, [tasks]);

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main-content"><Navbar /><Loader text="Loading Dashboard..." /></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="header-left"><h1>Welcome Back, {user?.name || "User"}</h1><p>Quick overview of your productivity, deadlines, and important tasks.</p></div>
            <button className="add-btn" onClick={() => { setSelectedTask(null); setShowModal(true); }}><FaPlus /> New Task</button>
          </div>

          <div className="stats-grid">
            <StatsCard title="Total Tasks" value={totalTasks} icon={<FaTasks />} color="#2563EB" />
            <StatsCard title="Completed" value={completedTasks} icon={<FaCheckCircle />} color="#22C55E" />
            <StatsCard title="Pending" value={pendingTasks} icon={<FaClock />} color="#F59E0B" />
            <StatsCard title="In Progress" value={inProgressTasks} icon={<FaClock />} color="#2563EB" />
            <StatsCard title="Overdue" value={overdueTasks} icon={<FaExclamationTriangle />} color="#EF4444" />
          </div>

          <TaskChart total={totalTasks} completed={completedTasks} pending={pendingTasks} inProgress={inProgressTasks} overdue={overdueTasks} />

          <div className="dashboard-insights-grid">
            <section className="reminder-card dashboard-insight-card">
              <div className="reminder-heading">
                <FaBell />
                <div>
                  <h2>Upcoming Reminders</h2>
                  <p>Tasks that need attention today or tomorrow.</p>
                </div>
              </div>

              {upcomingReminders.length === 0 ? (
                <div className="reminder-empty">No reminders for today or tomorrow.</div>
              ) : (
                <div className="reminder-list">
                  {upcomingReminders.map((task) => (
                    <div className={`reminder-item ${task.tone}`} key={task.id}>
                      <span>{task.title}</span>
                      <strong>{task.label}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="chart-card dashboard-insight-card weekly-card">
              <div className="insight-heading">
                <h2>Weekly Productivity</h2>
                <p>Completed tasks by weekday.</p>
              </div>

              <div className="weekly-grid compact">
                {weeklyData.map((day) => (
                  <div className="weekly-bar" key={day.label} title={`${day.dateLabel}: ${day.count} completed`}>
                    <span className={day.count === 0 ? "empty" : ""} style={{ height: `${day.height}px` }} />
                    <strong>{day.count}</strong>
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <h2 className="dashboard-section-title">Focus Tasks</h2>
          <div className="task-grid">
            {focusTasks.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><h2>No Tasks Yet</h2><p>Create your first task!</p><button className="empty-action-btn" onClick={() => { setSelectedTask(null); setShowModal(true); }}><FaPlus /> Create Task</button></div>
            ) : (
              focusTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={(task) => { setSelectedTask(task); setShowModal(true); }} onDelete={(id) => { setDeleteTaskId(id); setShowDeleteModal(true); }} onTogglePin={(task) => updateTaskQuick(task, { pinned: task.pinned ? 0 : 1 })} onToggleFavorite={(task) => updateTaskQuick(task, { favorite: task.favorite ? 0 : 1 })} />)
            )}
          </div>
        </div>
      </div>

      {showModal && <TaskModal closeModal={() => { setShowModal(false); setSelectedTask(null); }} refreshTasks={fetchTasks} task={selectedTask} />}
      {showDeleteModal && <DeleteModal taskId={deleteTaskId} refreshTasks={fetchTasks} closeModal={() => { setShowDeleteModal(false); setDeleteTaskId(null); }} />}
    </div>
  );
}

export default Dashboard;



