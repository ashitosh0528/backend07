import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs'


   
    cloudinary.config({ 
        cloud_name: process.env.CLAUDINARY_CLOUD_NAME, 
        api_key: process.env.CLAUDINARY_API_KEY, 
        api_secret: process.env.CLAUDINARY_API_SECRET
    });
    
   const uploadOnCloudinary = async(localFilePath)=>{

    try {
        if(!localFilePath) return null

     const res = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        // console.log()
return res
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove file
        return null
        
    }
   }


   export {uploadOnCloudinary}