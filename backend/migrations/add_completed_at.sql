USE task_manager;

ALTER TABLE tasks
ADD COLUMN completed_at DATETIME NULL;

UPDATE tasks
SET completed_at = updated_at
WHERE status = 'Completed' AND completed_at IS NULL;
