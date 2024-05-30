import express from "express";
import { addJobs } from "../controllers/jobsController.js";
import { validateToken } from "../helpers/Token.js";
import { categoriesAll } from "../controllers/jobsCategories.js";

const categoriesRoute = express.Router()

categoriesRoute.get("/all", categoriesAll)


export default categoriesRoute