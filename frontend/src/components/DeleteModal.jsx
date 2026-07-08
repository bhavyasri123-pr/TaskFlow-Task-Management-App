import { useState } from "react";
import "../styles/deletemodal.css";
import API from "../services/api";
import { toast } from "react-toastify";
import Loader from "./Loader";

function DeleteModal({ taskId, closeModal, refreshTasks }) {
  const [loading, setLoading] = useState(false);

  const deleteTask = async () => {
    setLoading(true);

    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success("Task Deleted");
      refreshTasks();
      closeModal();
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-overlay">
      <div className="delete-modal">
        <h2>Delete Task?</h2>
        <p>Are you sure you want to delete this task?</p>

        <div className="delete-buttons">
          <button className="cancel-delete" onClick={closeModal} disabled={loading}>
            Cancel
          </button>

          <button className="confirm-delete" onClick={deleteTask} disabled={loading}>
            {loading ? <Loader text="Deleting..." compact /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
