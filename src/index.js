// require('dotenv').config({
//     path:'./.env'
// })
import dotenv from 'dotenv'

import express from 'express'
import connectDB from './db/index.js'
const app = express()

dotenv.config({
    path:'./.env'
})
connectDB()











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