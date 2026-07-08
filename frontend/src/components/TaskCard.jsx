import {
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaBell,
  FaPaperclip,
  FaThumbtack,
  FaStar
} from "react-icons/fa";

import "../styles/taskcard.css";

function TaskCard({ task, onEdit, onDelete, onTogglePin, onToggleFavorite }) {
  const priorityClass = task.priority.toLowerCase();
  const statusClass = task.status.toLowerCase().replace(/\s+/g, "-");

  const getDueInfo = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (task.status === "Completed") return { className: "completed", label: "Completed", countdown: dueDate.toLocaleDateString() };
    if (diffDays < 0) {
      const lateDays = Math.abs(diffDays);
      return { className: "overdue", label: "Overdue", countdown: `${lateDays} day${lateDays === 1 ? "" : "s"} late` };
    }
    if (diffDays === 0) return { className: "today", label: "Today", countdown: "Due today" };
    return { className: "upcoming", label: "Upcoming", countdown: `${diffDays} day${diffDays === 1 ? "" : "s"} left` };
  };

  const dueInfo = getDueInfo();

  return (
    <div className={`task-card ${task.pinned ? "pinned-card" : ""}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        <div className="quick-actions">
          <button type="button" className={task.pinned ? "active" : ""} onClick={() => onTogglePin?.(task)} title="Pin task"><FaThumbtack /></button>
          <button type="button" className={task.favorite ? "active favorite" : ""} onClick={() => onToggleFavorite?.(task)} title="Favorite task"><FaStar /></button>
        </div>
      </div>

      <p>{task.description}</p>

      <div className="badges">
        <span className={`priority ${priorityClass}`}>{task.priority}</span>
        <span className={`status ${statusClass}`}>{task.status}</span>
        <span className="category-badge">{task.category}</span>
      </div>

      <div className="task-meta-list">
        <span className={`due-badge ${dueInfo.className}`}><FaCalendarAlt /><span>{dueInfo.label}</span><small>{dueInfo.countdown}</small></span>
        {task.reminder_at && <span className="mini-meta"><FaBell /> {new Date(task.reminder_at).toLocaleString()}</span>}
        {task.attachment_name && <span className="mini-meta"><FaPaperclip /> {task.attachment_name}</span>}
      </div>

      <div className="task-footer">
        <span>{new Date(task.due_date).toLocaleDateString()}</span>
        <div className="task-actions">
          <FaEdit className="edit" onClick={() => onEdit(task)} />
          <FaTrash className="delete" onClick={() => onDelete(task.id)} />
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
