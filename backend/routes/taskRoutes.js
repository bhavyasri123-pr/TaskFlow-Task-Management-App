import express from "express";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Create Task
router.post("/", verifyToken, createTask);
router.get("/", verifyToken, getTasks);
router.get("/:id", verifyToken, getTaskById);
router.put("/:id", verifyToken, updateTask);
router.delete("/:id", verifyToken, deleteTask);
export default router;