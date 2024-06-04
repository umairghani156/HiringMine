import express from "express";
import { addJobs } from "../controllers/jobsController.js";
import { validateToken } from "../helpers/Token.js";
import { categoriesAll, getCategory } from "../controllers/jobsCategories.js";

const categoriesRoute = express.Router()

categoriesRoute.get("/all", categoriesAll)
categoriesRoute.get("/job", getCategory)



export default categoriesRoute