import { BADREQUEST, INTERNALERROR, NOTFOUND, OK } from "../constants/httpStatus.js"
import { responseMessages } from "../constants/responseMessage.js";
import Jobs from "../models/Jobs.js"

export const categoriesAll =async (req, res)=>{
    try{
        const jobCounts = await Jobs.aggregate([
            {
                $group: {
                    _id: "$designation",
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedJobCounts = jobCounts.map(group => ({
            name: group._id,
            jobsCount: group.count
        }));
        res.status(200).json(formattedJobCounts);
        

    }catch(error){
        res.status(BADREQUEST).send({
            status: false,
            message: error.message
        })
    }
};

export const getCategory = async(req, res)=>{
    const {keyword,limit} = req.query;
    try{
        const jobs = await Jobs.find({designation: new RegExp(keyword, 'i') }).limit(limit)
        if(jobs.length === 0){
            return res.status(NOTFOUND).send({
                status: false,
                message: "No Jobs Found"
            })
        }
        return res.status(OK).send(jobs)

    }catch(error){
        return res.status(INTERNALERROR).send({
            status: false,
            message: error.message
        })
    }
}

export const getCategoriesAll =async (req, res)=>{
    const {keyword,type,price,level,categories} = req.query;
    console.log(keyword);
    console.log(price);
    console.log(type);
    console.log(categories);
    const salaryTargetStart = parseInt(price.split("-")[0]);
    const salaryTargetEnd = parseInt(price.split("-")[1]);
    const isLevel = level && level.split("-")[0].slice(0,1).toUpperCase() + level.split("-")[0].slice(1).toLowerCase()

    console.log(isLevel);


    try{
        let query = {};
        if(keyword){
            query.designation = { $regex: new RegExp(keyword, 'i') };
        }
        if(type){
            query.jobType = type;
        }
        if(salaryTargetStart && salaryTargetEnd){
            const start = parseInt(salaryTargetStart, 10);
            const end = parseInt(salaryTargetEnd, 10);
            query.$and = [
                { payRangeStart: { $gte: start } },
                { payRangeEnd: { $lte: end } }
            ];
        }
        if(level){
            query.level = { $regex: new RegExp(level, 'i') };
        }
    // if(experience){
    //     query.experience = experience
    // }
    if(categories){
        query.categories = { $regex: new RegExp(categories, 'i') };
    }
    // if(jobs_feaseability){
    //     query.jobFeseability = jobs_feaseability
    // }
    //console.log("query",query);
        try{
        const response = await Jobs.find(query)
        if (response.length === 0) {
            return res.status(404).send({
                status: false,
                message: 'No matching jobs found based on your search criteria.'
            });
        }
         return res.status(OK).send(response)
        
        }catch(err){
            res.status(403).send(err.message)
        }

    }catch(error){
        res.status(BADREQUEST).send({
            status: false,
            message: responseMessages.INTERNAL_ERROR_MESSAGE,
        })
    }

}