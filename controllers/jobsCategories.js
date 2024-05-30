import { BADREQUEST } from "../constants/httpStatus.js"
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
}