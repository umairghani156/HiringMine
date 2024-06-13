import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./db/config.js";
import authRoute from "./routes/auth.js";
import "./cronJob.js"
import jobsRoute from "./routes/jobs.js";
import categoriesRoute from "./routes/category.js";
const app = express();
dotenv.config()
app.use(express.json())
app.use(cors({
    origin: "https://hiringmine-frontend.vercel.app",
    methods: ["POST","GET","PUT","DELETE"],
    withCredentials: true,
}))
app.use(cookieParser())
dbConnection()
const PORT = process.env.port_number || 7000
app.get("/",(req,res)=>{
    res.send("Chl rha hn")
})

app.use("/api/auth", authRoute)
app.use("/api/jobs", jobsRoute)
app.use("/api/categories", categoriesRoute)






app.listen(PORT,()=>{
    console.log("Server is Running on the PORT "+PORT);
})
