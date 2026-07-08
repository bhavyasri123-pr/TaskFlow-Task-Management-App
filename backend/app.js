import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import verifyToken from "./middleware/verifyToken.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/", (req, res) => {
    res.send("Task Management API Running...");
});
app.get("/api/protected", verifyToken, (req, res) => {

    res.json({

        success: true,

        message: "Protected Route Accessed Successfully",

        user: req.user

    });

});

// Global Error Handler
app.use(errorHandler);

export default app;