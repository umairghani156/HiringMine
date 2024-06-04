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