import { BADREQUEST, CREATED, INTERNALERROR, NOTFOUND, OK } from "../constants/httpStatus.js"
import { responseMessages } from "../constants/responseMessage.js";
import Jobs from "../models/Jobs.js";
import { sendError } from "../utils/response.js"

export const addJobs = async (req, res)=>{
    console.log(req.body);
    res.setHeader('Content-Type', 'text/html');
    const {companyName,designation,jobFeseability,city,counrty,payRangeStart,payRangeEnd,jobType,
        summary,
        experience,
        skill,
        hashTags,
        views} = req.body;
    try{
        const job = new Jobs({
            companyName: companyName,
            designation: designation,
            jobFeseability: jobFeseability,
            summary: summary,
            city:city,
            counrty: counrty,
            payRangeStart:payRangeStart,
            payRangeEnd:payRangeEnd,
            jobType:jobType,
            experience:experience,
            skill:skill,
            hashTags:hashTags,
            views:views,
        })
        const response = await job.save()
        console.log("job",response);
         res.status(CREATED).send({
            status: true,
            message: responseMessages.ADD_SUCCESS_MESSAGES,
            data: response
        })


    }catch(error){
      res.status(BADREQUEST).send(sendError(INTERNALERROR))
      console.log(error);
    }
};

export const allJobs = async (req, res)=>{
    const limit = req.query.limit; // default value
  const pageNo = req.query.pageNo || 1; // default value
  const keyWord = req.query.keyWord || '';
  const category = req.query.category || '';
    try{
    if(limit){
    const query = {};
    if (keyWord) {
      query.designation = keyWord.toLowerCase();
    }
    const skip = (pageNo - 1) * limit;

    // Fetch jobs from the database with limit and skip
    const totalJobsCount = await Jobs.countDocuments(query);
    console.log("t",totalJobsCount);
    const adjustedSkip = skip % totalJobsCount;
    console.log("ad",adjustedSkip);
    const jobs = await Jobs.find(query).limit(limit).skip(adjustedSkip);

    res.status(OK).send(jobs);
}else{
    const jobs = await Jobs()
    res.status(OK).send(jobs)
}
    }catch(error){
        res.status(BADREQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

export const getJob = async (req, res)=>{
    const jobId = req.params.id
    try{
        const singleJob = await Jobs.findOne({_id:jobId})
        if(!singleJob) res.status(NOTFOUND).send({
            status: false,
            message: "Post not found"
        })
       return res.status(OK).send(singleJob)

    }catch(error){
     res.status(BADREQUEST).send({
        status: false,
        message: error.message
     })
    }
}