import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  deleteTask,
} from "../controller/task.controller.js";

const router = express.Router();

router.post("/add-task", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);

export default router;