import Task from "../model/task.model.js";
import Redis from "ioredis";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
} from "../utils/apiHelper.js";

const redis = new Redis();


    export const createTask = asyncHandler(async (req, res) => {
        const { title, inputText, operation } = req.body;
        console.log("req.body : ", req.body);


        // Validation
        if (!title || !inputText || !operation) {
            throw new ApiError(400, "All fields are required");
        }

        const allowedOperations = [
            "uppercase",
            "lowercase",
            "reverse",
            "wordcount",
        ];

        if (!allowedOperations.includes(operation)) {
            throw new ApiError(400, "Invalid operation");
        }

        // Create Task
        const task = await Task.create({
            title,
            inputText,
            operation,
            status: "pending",
            logs: [{ message: "Task created" }],
        });

        // Push to Redis Queue
        await redis.lpush(
            "task_queue",
            JSON.stringify({ taskId: task._id })
        );

        return res.status(201).json(
            new ApiResponse(
                201,
                task,
                "Task created and added to queue"
            )
        );
    });

//   Get All Tasks (with pagination)

export const getAllTasks = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const total = await Task.countDocuments();

    const tasks = await Task.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tasks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            "Tasks fetched successfully"
        )
    );
});

// Get Single Task

export const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched"));
});

// Delete Task 
export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await task.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted"));
});