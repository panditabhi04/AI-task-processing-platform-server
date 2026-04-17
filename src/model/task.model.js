import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    inputText: { type: String, required: true },

    operation: {
      type: String,
      enum: ["uppercase", "lowercase", "reverse", "wordcount"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
    },

    result: String,
    error: String,

    logs: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);