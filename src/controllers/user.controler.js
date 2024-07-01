import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiErrors.js'
import {User} from  '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse,} from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
const generateAccessAndRefreshTokens = async(userId)=>{

try {
     const user= await User.findById(userId)  
 const accessToken = user.generateAccessToken()
 const refreshToken = user.generateRefreshToken()
 user.refreshToken =refreshToken
  await user.save({validateBeforeSave:false})

return {accessToken,refreshToken}
 } catch (error) {
          throw new ApiError(500, "somethong went wrong")
     }
}

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

const existedUser= await User.findOne({
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
     username:username,
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

return res.status(201).json(
new ApiResponse(200, createdUser,"user rejisterd successfully")
)

}) 

const loginUser = asyncHandler(async(req,res)=>{

     // get fields from body 
    const {email,username,password}= req.body
//     check the fields are filled or not 
    if(!(username || email)){
     throw new ApiError(400, "username or email is reqired")
    }
// find user is present in database 
    const user = await User.findOne({
     $or:[{username},{email}]
    })
if(!user){
     throw new ApiError(404, "user not found")
}
 //now check for given password is valid or not

 const isPasswordValidate = await user.ispasswordcorrect(password)

 if(!isPasswordValidate){
     throw new ApiError(404,'please enter correct password ')
 }
//  create refreshtoken ad accesstoken 

const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

// delete field from user 
const loggedInUser = await User.findById(user._id).select(
     "-password -refreshToken"
)

// cookies send krne te krtana kahi options sudha pathvayche astat 

const options={
     httpOnly:true,
     secure:true
}

return res.
status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
     new ApiResponse(
          201,
          {
               user:loggedInUser,accessToken,refreshToken
          },
          "user logged in successfully"
)
)




})

// logout karayla aplyakde he data nasto karan apn logout sathi data nahi ghet 
const logOutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
     req.user._id,
     {
          $set:
          {
               refreshToken:undefined
          },   
     },
     {
         new:true
     }
)
const options={
     httpOnly:true,
     secure:true
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(
      new ApiResponse(201,{},"user logged out sucessfully")

)
})

const refreshToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookieParser.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
     throw new ApiError(401,"unauthorised rerquest")
    }
const decodedToken =jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
)

if(!decodedToken){
     throw new ApiError(401,"")
}

const user = await User.findById(decodedToken?._id)

if(!user){
     throw new ApiError(401,"invalid refresh token")
}

if(incomingRefreshToken !== user.refreshToken){
     throw new ApiError(401,"refresh token is expired")
}

const options= {
     httpOnly:true,
     secure:true
}

 const {accessToken,newRefreshToken} =await generateAccessAndRefreshTokens(user._id)
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newRefreshToken,options)
 .json(
     new ApiResponse(
          200,
          {
               accessToken, newRefreshToken
          },
          "access token refreshed"
     )
 )
})

export {registerUser,
     loginUser,
     logOutUser,
     refreshToken
}