import express from "express";
import { forgotPasswordEmail, getUser, login, resetPasswordEmail, signUp, verifyEmail } from "../controllers/authController.js";
import { validateToken } from "../helpers/Token.js";

const authRoute = express.Router()

authRoute.post("/signup", signUp)
authRoute.post("/login", login)
authRoute.post("/verifyEmail", validateToken, verifyEmail);
authRoute.post("/forgotPassword", forgotPasswordEmail)
authRoute.put('/resetPassword', resetPasswordEmail);
authRoute.put("/user", getUser)



export default authRoute;