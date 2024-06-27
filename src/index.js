// require('dotenv').config({
//     path:'./.env'
// })
import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'


dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log('mogodb connection failed',err)
})










/*
// function connectDb(){}
// connectDb()

// use iife for instant calling
(async()=>{
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error :",error)
        throw error
      })
      app.listen(process.env.PORT , ()=>{
console.log(`app is listning on port ${process.env.PORT}`)
      })
    } catch (error) {
        console.error('Error:',error)
        throw error
    }
})()
    */