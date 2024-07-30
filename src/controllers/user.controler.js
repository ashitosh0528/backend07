          import {asyncHandler} from '../utils/asyncHandler.js'
          import { ApiError } from '../utils/apiErrors.js'
          import {User} from  '../models/user.models.js'
          import {uploadOnCloudinary} from '../utils/cloudinary.js'
          import {ApiResponse,} from '../utils/apiResponse.js'
          import jwt from 'jsonwebtoken'
          const generateAccessAndRefreshTokens = async(userId)=>{

          try {
               console.log(userId)
               const user= await User.findById(userId)
               console.log(user)  
          const accessToken = user.generateAccessToken()
          //  console.log(accessToken)   
          const refreshToken = user.generateRefreshToken()
          //  console.log(refreshToken ,"no refresh token")    
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
               throw new ApiError(409,'user already existed with email or username')
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
          // const {email,username,password}= req.body     before
          const {email,username,password,otp}= req.body

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
// new lines 
if (otp) {
     if (user.otp !== otp || user.otpExpires < Date.now()) {
       throw new ApiError(400, 'Invalid or expired OTP');
     }
     await user.clearOTP();
   } else {
     const isPasswordValid = await user.ispasswordcorrect(password);
     if (!isPasswordValid) {
       throw new ApiError(400, 'Invalid password');
     }
   }

          //now check for given password is valid or not
          // console.log('Input password:', password);
          // console.log('Stored hashed password:', user.password);
     // before      const isPasswordValid = await user.ispasswordcorrect(password)
          // console.log('Password validation result:', isPasswordValid);

     //   before   // if(!isPasswordValid){
          //      throw new ApiError(404,'please enter correct password')
          // }
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
               console.log('User ID:', req.user._id); // Log user ID
               console.log('Token from request:', req.cookies.accessToken); 
          await User.findByIdAndUpdate(
               req.user._id,
               {
                    $unset:
                    {
                         refreshToken:1
                    },   
               },
               {
               new:true
               }
          )
          const options={
               httpOnly:true,
               secure:true
               // secure: process.env.NODE_ENV === 'production'
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
          const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

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

          const changeCurrentPassword = asyncHandler(async(req,res)=>{

               const{oldPassword,newPassword}=req.body
          const user = await User.findById(req.user?._id)
          user.ispasswordcorrect(oldPassword) 
          if(!ispasswordcorrect)  {
               throw new ApiError(400, "invalid password")

          }
          user.password = newPassword
          await user.save({validateBeforeSave:false})

          return res.status(200)
          .json(new ApiResponse(200,{},'password changed sucessfully' ) )

          })

          const getCurrentUser = asyncHandler(async(req,res)=>{
          return res
          .status(200)
          .json(new ApiResponse(
               200,
               req.user,
               "current user fetched successfully"))    
          })

          const updateAccountDetails =asyncHandler(async(req,res)=>{
          const {fullname,email} =req.body
          if(!(fullname || email)){
               throw new ApiError(400, "all fields are required")
          }

          const user = await User.findByIdAndUpdate(
               req.user?._id,
               {
          $set:
          {
               fullname,
               email:email
          }
               },
               {new:true}

          ).select("-password")
          res.status(200)
          .json(ApiResponse(201,
               user,
               "account details updated successfully"
          ))
          })


          const updateAvatar =asyncHandler(async(req,res)=>{
          const avatarLocalPath = req.file?.path
          if(!avatarLocalPath){
          throw new ApiError(400,'avatar file is missing')

          const avatar = await uploadOnCloudinary(avatarLocalPath)

          if(!avatar.url){
               throw new ApiError(400,'error while uploading on avatar')
          }

          const user =await User.findByIdAndUpdate(
               req.user?._id,
               {
          $set:{
               avatar:avatar.url
          }
               },
               {new:true}

          ).select("-password")
          res.status(200)
          .json(ApiResponse(201,
               user,
               "avatar updated successfully"
          ))

          }

          })


          const updateCoverImage =asyncHandler(async(req,res)=>{
               const coverImageLocalPath = req.file?.path
               if(!coverImageLocalPath){
               throw new ApiError(400,'avatar file is missing')
               
               const coverimage = await uploadOnCloudinary(coverImageLocalPath)
               
               if(!coverimage.url){
                    throw new ApiError(400,'error while uploading on avatar')
               }
               
               const user =await User.findByIdAndUpdate(
                    req.user?._id,
                    {
               $set:{
                    coverimage:coverimage.url
               }
                    },
                    {new:true}
               
               ).select("-password")
               res.status(200)
               .json(ApiResponse(201,
                    user,
                    "coverimage updated successfully"
               ))
               
               }
               
               })
          export {
               registerUser,
               loginUser,
               logOutUser,
               refreshToken,
               changeCurrentPassword,
               getCurrentUser,
               updateAccountDetails,
               updateAvatar,
               updateCoverImage,
               generateAccessAndRefreshTokens

          }