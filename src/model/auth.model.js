import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import crypto from "crypto"
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      // default: "client",
    },
    password: {
      type: String,
      required: true,
      index: true
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);
// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// creates temporary reset key for password recovery
userSchema.methods.createPasswordForgotToken = function () {
  const forgotToken = crypto.randomBytes(32).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");
  this.forgotPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return forgotToken;
};
export default mongoose.model("User", userSchema);
