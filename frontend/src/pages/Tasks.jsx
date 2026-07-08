import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaList, FaPlus, FaSearch } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import DeleteModal from "../components/DeleteModal";
import Loader from "../components/Loader";
import API from "../services/api";
import socket from "../services/socket";

import "../styles/dashboard.css";
import "../styles/taskcard.css";

const TASKS_PER_PAGE = 10;

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created");
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = viewMode === "calendar"
        ? { all: true, search: searchTerm, filter, sortBy }
        : { page: currentPage, limit: TASKS_PER_PAGE, search: searchTerm, filter, sortBy };

      const res = await API.get("/tasks", { params });
      setTasks(res.data.tasks || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalTasks(res.data.totalTasks || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filter, sortBy, viewMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, sortBy, viewMode]);

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
  }, [fetchTasks]);

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

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = new Date(year, month, day).toISOString().slice(0, 10);
      return {
        day,
        tasks: tasks.filter((task) => task.due_date?.slice(0, 10) === dateKey)
      };
    });
  }, [tasks]);

  const showPagination = viewMode === "list" && totalTasks > TASKS_PER_PAGE;

  if (loading && tasks.length === 0) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main-content"><Navbar /><Loader text="Loading tasks..." /></div>
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
            <div><h1>My Tasks</h1><p>Manage, sort, pin, and schedule your tasks.</p></div>
            <button className="add-btn" onClick={() => { setSelectedTask(null); setShowModal(true); }}><FaPlus /> New Task</button>
          </div>

          <div className="toolbar">
            <div className="search-box"><FaSearch /><input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="toolbar-controls">
              <div className="view-toggle">
                <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}><FaList /> List</button>
                <button type="button" className={viewMode === "calendar" ? "active" : ""} onClick={() => setViewMode("calendar")}><FaCalendarAlt /> Calendar</button>
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Internship">Internship</option>
                <option value="Project">Project</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="created">Sort: Created Date</option>
                <option value="due">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
              </select>
            </div>
          </div>

          {loading && <Loader text="Updating tasks..." compact />}

          {viewMode === "calendar" ? (
            <div className="calendar-grid">
              {calendarDays.map((day) => (
                <div className="calendar-day" key={day.day}>
                  <strong>{day.day}</strong>
                  {day.tasks.slice(0, 3).map((task) => <span key={task.id}>{task.title}</span>)}
                </div>
              ))}
            </div>
          ) : (
            <div className="task-grid">
              {tasks.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><h2>No Tasks Yet</h2><p>Create your first task!</p><button className="empty-action-btn" onClick={() => { setSelectedTask(null); setShowModal(true); }}><FaPlus /> Create Task</button></div>
              ) : (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={(task) => { setSelectedTask(task); setShowModal(true); }} onDelete={(id) => { setDeleteTaskId(id); setShowDeleteModal(true); }} onTogglePin={(task) => updateTaskQuick(task, { pinned: task.pinned ? 0 : 1 })} onToggleFavorite={(task) => updateTaskQuick(task, { favorite: task.favorite ? 0 : 1 })} />
                ))
              )}
            </div>
          )}

          {showPagination && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
            </div>
          )}
        </div>
      </div>

      {showModal && <TaskModal task={selectedTask} refreshTasks={fetchTasks} closeModal={() => { setShowModal(false); setSelectedTask(null); }} />}
      {showDeleteModal && <DeleteModal taskId={deleteTaskId} refreshTasks={fetchTasks} closeModal={() => { setShowDeleteModal(false); setDeleteTaskId(null); }} />}
    </div>
  );
}

export default Tasks;
