import express from "express";
import { addJobs, allJobs, getJob } from "../controllers/jobsController.js";
import { validateToken } from "../helpers/Token.js";

const jobsRoute = express.Router()

jobsRoute.post("/add", addJobs)
jobsRoute.get("/all", allJobs)
jobsRoute.get("/:id", getJob)




export default jobsRoute