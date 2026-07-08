import db from "../config/db.js";
import { getIO } from "../config/socket.js";
import { DEFAULT_PAGE_SIZE, ALLOWED_PRIORITIES, ALLOWED_STATUSES, CATEGORIES } from "../config/constants.js";
import { taskSchema } from "../validators/taskValidator.js";

const toBooleanNumber = (value) => (value === true || value === 1 || value === "1" ? 1 : 0);
const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const emitTaskEvent = (eventName, payload) => {
  try {
    getIO().emit(eventName, payload);
  } catch (error) {
    console.warn("Socket event skipped:", error.message);
  }
};

const normalizeTaskPayload = (data) => ({
  title: data.title,
  description: data.description,
  category: data.category || "Study",
  priority: data.priority || "Medium",
  status: data.status || "Pending",
  due_date: data.due_date,
  reminder_at: data.reminder_at || null,
  pinned: toBooleanNumber(data.pinned),
  favorite: toBooleanNumber(data.favorite),
  attachment_name: data.attachment_name || null,
});

const buildTaskFilters = (req) => {
  const where = ["user_id = ?"];
  const params = [req.user.id];
  const search = String(req.query.search || "").trim();
  const filter = String(req.query.filter || "All").trim();

  if (search) {
    where.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (filter && filter !== "All") {
    if (ALLOWED_STATUSES.includes(filter)) {
      where.push("status = ?");
      params.push(filter);
    } else if (ALLOWED_PRIORITIES.includes(filter)) {
      where.push("priority = ?");
      params.push(filter);
    } else if (CATEGORIES.includes(filter)) {
      where.push("category = ?");
      params.push(filter);
    }
  }

  return { whereSql: where.join(" AND "), params };
};

const getOrderBy = (sortBy) => {
  if (sortBy === "due") return "pinned DESC, due_date ASC, created_at DESC";
  if (sortBy === "priority") return "pinned DESC, FIELD(priority, 'High', 'Medium', 'Low'), created_at DESC";
  return "pinned DESC, created_at DESC";
};

export const createTask = (req, res, next) => {
  try {
    const task = normalizeTaskPayload(taskSchema.parse(req.body));
    const user_id = req.user.id;
    const completed_at = task.status === "Completed" ? new Date() : null;

    const sql = `
      INSERT INTO tasks
      (user_id, title, description, category, priority, status, due_date, reminder_at, completed_at, pinned, favorite, attachment_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [user_id, task.title, task.description, task.category, task.priority, task.status, task.due_date, task.reminder_at, completed_at, task.pinned, task.favorite, task.attachment_name],
      (err, result) => {
        if (err) return next(err);

        const newTask = { id: result.insertId, user_id, ...task, completed_at };
        emitTaskEvent("task_created", { userId: user_id, task: newTask });

        return res.status(201).json({ success: true, message: "Task Created Successfully", task: newTask });
      }
    );
  } catch (error) {
    return next(error);
  }
};

export const getTasks = (req, res, next) => {
  const all = req.query.all === "true";
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, DEFAULT_PAGE_SIZE), 100);
  const offset = (page - 1) * limit;
  const { whereSql, params } = buildTaskFilters(req);
  const orderBy = getOrderBy(req.query.sortBy);

  const countSql = `SELECT COUNT(*) AS total FROM tasks WHERE ${whereSql}`;

  db.query(countSql, params, (err, countResult) => {
    if (err) return next(err);

    const totalTasks = countResult[0]?.total || 0;
    const dataSql = `
      SELECT *
      FROM tasks
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      ${all ? "" : "LIMIT ? OFFSET ?"}
    `;
    const dataParams = all ? params : [...params, limit, offset];

    db.query(dataSql, dataParams, (dataErr, tasks) => {
      if (dataErr) return next(dataErr);

      return res.status(200).json({
        success: true,
        totalTasks,
        totalPages: all ? 1 : Math.max(1, Math.ceil(totalTasks / limit)),
        currentPage: all ? 1 : page,
        limit: all ? totalTasks : limit,
        tasks,
      });
    });
  });
};

export const updateTask = (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const task = normalizeTaskPayload(taskSchema.parse(req.body));

    const sql = `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        category = ?,
        priority = ?,
        status = ?,
        due_date = ?,
        reminder_at = ?,
        completed_at = CASE
          WHEN ? = 'Completed' AND completed_at IS NULL THEN NOW()
          WHEN ? <> 'Completed' THEN NULL
          ELSE completed_at
        END,
        pinned = ?,
        favorite = ?,
        attachment_name = ?
      WHERE id = ? AND user_id = ?
    `;

    db.query(
      sql,
      [task.title, task.description, task.category, task.priority, task.status, task.due_date, task.reminder_at, task.status, task.status, task.pinned, task.favorite, task.attachment_name, id, user_id],
      (err, result) => {
        if (err) return next(err);

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Task not found" });
        }

        const updatedTask = { id: Number(id), user_id, ...task };
        emitTaskEvent("task_updated", { userId: user_id, task: updatedTask });

        return res.status(200).json({ success: true, message: "Task Updated Successfully", task: updatedTask });
      }
    );
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, user_id], (err, result) => {
    if (err) return next(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    emitTaskEvent("task_deleted", { userId: user_id, id: Number(id) });

    return res.status(200).json({ success: true, message: "Task Deleted Successfully" });
  });
};

export const getTaskById = (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, user_id], (err, result) => {
    if (err) return next(err);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, task: result[0] });
  });
};
