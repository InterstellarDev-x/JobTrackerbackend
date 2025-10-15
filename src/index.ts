import express from 'express'
import mongoose from 'mongoose'
import UserRoute from './Router'
import cors from 'cors'
const app = express()



app.use(express.json())

app.use(cors({
  origin: 'https://job-tracker-front-beta.vercel.app', 
  methods: 'GET,POST,PUT,DELETE'
}));



app.use("/api/v1" , UserRoute)


async function start() : Promise<undefined>{
   await mongoose.connect("mongodb+srv://admin:vldybNRPp9KSJ9he@cluster0.odmxu.mongodb.net/JobTracker")
    app.listen(3000)
    console.log("app is listening on port 3000")
}


start();
