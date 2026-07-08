import { useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import Loader from "./Loader";
import "../styles/taskmodal.css";

function TaskModal({ closeModal, refreshTasks, task }) {
  const formatReminder = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || "Study",
    priority: task?.priority || "Medium",
    status: task?.status || "Pending",
    due_date: task?.due_date ? task.due_date.substring(0, 10) : "",
    reminder_at: formatReminder(task?.reminder_at),
    pinned: Boolean(task?.pinned),
    favorite: Boolean(task?.favorite),
    attachment_name: task?.attachment_name || ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData({
      ...formData,
      attachment_name: file?.name || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      reminder_at: formData.reminder_at || null,
      pinned: formData.pinned ? 1 : 0,
      favorite: formData.favorite ? 1 : 0
    };

    try {
      if (task) {
        await API.put(`/tasks/${task.id}`, payload);
        toast.success("Updated Successfully");
      } else {
        await API.post("/tasks", payload);
        toast.success("Task Created");
      }

      refreshTasks();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{task ? "Update Task" : "Create New Task"}</h2>

        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Task Title" value={formData.title} onChange={handleChange} required />

          <textarea name="description" placeholder="Description" rows="4" value={formData.description} onChange={handleChange} required />

          <select name="category" value={formData.category} onChange={handleChange}>
            <option>Study</option>
            <option>Work</option>
            <option>Personal</option>
            <option>Internship</option>
            <option>Project</option>
          </select>

          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required />

          <input type="datetime-local" name="reminder_at" value={formData.reminder_at} onChange={handleChange} />

          <label className="file-input-label">
            Attachment
            <input type="file" onChange={handleFileChange} />
            {formData.attachment_name && <span>{formData.attachment_name}</span>}
          </label>

          <div className="task-flags">
            <label><input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleChange} /> Pin important</label>
            <label><input type="checkbox" name="favorite" checked={formData.favorite} onChange={handleChange} /> Favorite</label>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={closeModal} disabled={loading}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? <Loader text="Saving..." compact /> : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
