import mongoose from "mongoose";
const schema =  mongoose.Schema




const userschema = new schema({
    email : { type :String  , required : true , unique : true},
    password : { type : String , required : true},
    createdAt : { type : Date , default : Date.now}
})


const jobSchema = new schema({
    user : { type: mongoose.Schema.Types.ObjectId , require : true , ref: "user" },
    company : { type : String , required : true },
    status: { type: String, enum: ["Applied", "Interview", "Offer", "Rejected"] },
    role : { type : String , required : true },
    dateApplied : { type  : Date , default : Date.now},
    link : { type : String , required : true}
})



export const UserModel = mongoose.model("user" , userschema)
export const JobModel = mongoose.model("jobs" , jobSchema)
