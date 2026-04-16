import User from "../model/auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";
import { AUTH_MESSAGES } from "../utils/constant-message.js";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//  console.log(':::::::::::: process.env.JWT_SECRET', process.env.JWT_SECRET)


// export const signup = asyncHandler(async (req, res) => {
export const signup = async (req, res) => {
  try {
    let { name, email, password, phoneNumber } = req.body;
    console.log("req.body : ", req.body);

    // sanitize
    email = email.toLowerCase().trim();
    phoneNumber = phoneNumber?.trim();

    if (!name || !email || !password || !phoneNumber) {
      // return res.status(400).json({
      //   success: false,
      //   message: "All fields are required",
      // });
      throw new ApiError(400, AUTH_MESSAGES.EMPTY_FILDS);

    }

    // check email OR phone in single query 
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(400, AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      if (existingUser.phoneNumber === phoneNumber) {
        throw new ApiError(400, AUTH_MESSAGES.PHONE_ALREADY_EXISTS);
      }
    }

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    // ✅ fallback duplicate handler (IMPORTANT)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const login = asyncHandler(async (req, res) => {
export const login = (async (req, res) => {

  const { email, password } = req.body;
  const user = await User.findOne({ email });


  if (!user) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  // console.log("isMatch : ", isMatch);

  if (!isMatch) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }
  //  console.log(':::::::::::: process.env.JWT_SECRET', process.env.JWT_SECRET)
  const token = jwt.sign(

    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      },
      AUTH_MESSAGES.LOGIN_SUCCESS
    )
  );
});
