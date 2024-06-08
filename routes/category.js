import express from "express";
import { addJobs } from "../controllers/jobsController.js";
import { validateToken } from "../helpers/Token.js";
import { categoriesAll, getCategoriesAll, getCategory } from "../controllers/jobsCategories.js";

const categoriesRoute = express.Router()

categoriesRoute.get("/all", categoriesAll)
categoriesRoute.get("/job", getCategory)
categoriesRoute.get("/filteration/all", getCategoriesAll)




export default categoriesRoute