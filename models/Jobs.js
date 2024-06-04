import mongoose from "mongoose"
const jobs = mongoose.Schema(
    {
        companyName:{
            type: String,
            required: [true, 'Please Add Company Name'],
            trim: true,
        },
        designation: {
            type: String,
            required: [true, 'Please Add Designation'],
            trim: true,
        },
        jobFeseability: {
            type: String,
            required: [true, 'Please add Foreseability'],
        },
        summary:{
            type: String
        },
        city: {
            type: String,
            trim: true,
        },
        counrty: {
            type: String,
            trim: true,
        },
        payRangeStart: {
            type: Number
        },
        payRangeEnd: {
            type: Number,
    
        },
        jobType: {
            type: String,
            required: true
        },
        experience: {
            type: String,
        },
        skill:{
            type:[String]
        },
        hashTags:{
            type:[String]
        },
        views:{
            type: Number
        },
        level:{
            type: String,
        },
        categories:{
            type: String
        }

    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Jobs', jobs);