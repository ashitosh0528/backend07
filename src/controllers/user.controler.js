import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiErrors.js'
import {User} from  '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse,} from '../utils/apiResponse.js'
const registerUser = asyncHandler(async(req,res)=>{
// res.status(200).json({ 
//      message:'ok' 
//      }) 

// get data from frontend
const {email,password,fullname,username}=req.body
if(
     [email,password,fullname,username].some((field)=>
          field?.trim() ===''  )
){
throw new ApiError(400,'all fields are required')
}
// console.log(email,req.body)

// check that the user already existed or not 

const existedUser=User.findOne({
     $or:[{username},{email}]
})

if(existedUser){
     throw new ApiError(409,'yser already existed with email or username')
}

// now check images alet ka nhit 
// routs madhe jaun apn jo multer use kelay to aplyala access deto files cha 

 const avatarLocalPath = req.files?.avatar[0]?.path

 const coverimageLocalPath = req.files?.coverimage[0]?.path

//  aplyla avatar vali imga tr pahijech karan apn ti required thevle ahe 

if(!avatarLocalPath){
     throw new ApiError(400,'avatar is required')

}
// uload them to cloudnary 

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 const coverimage = await uploadOnCloudinary(coverimageLocalPath)

 if(!avatar){
     throw new ApiError(400,'avatar is required')
 }

const user = await User.create({
     username:username.ToLowerCase(),
     fullname,
     avatar:avatar.url,
     coverimage:coverimage?.url || '',
     password,
     email
 })
 const createdUser = await User.findById(user._id).select(
 "-password -refreshtoken" 
)


if(!createdUser){
     throw new ApiError(500,'something went wrong while registering the user')
}

return res.send(201).json(
new ApiResponse(200, createdUser,"user rejisterd successfully")
)

}) 
export {registerUser}