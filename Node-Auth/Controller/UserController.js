import UserModel from "../Model/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailconfig.js'
class UserController
{
  static userRegistration = async (req, res) =>
  {
    const { name, email, Password, password_confirmation, tc } = req.body
    const user = await UserModel.findOne({ email: email })
    if (user) {
      res.send({ "status": "failed", "message": "Email already exists" })
    } else {
      if (name && email && Password && password_confirmation && tc) {
        if (Password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(Password, salt)
            const doc = new UserModel({
              name: name,
              email: email,
              Password: hashPassword,
              tc: tc
            })
            await doc.save()
            const saved_user = await UserModel.findOne({ email: email })
            // Generate JWT Token
            const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
          } 
          catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Register" })
          }
        } else {
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
        }
      } 
      else {
        res.send({ "status": "failed", "message": "All fields are required" })
      }
    }
  }
  static userLogin = async (req, res) => {
    try {
      const { email, Password } = req.body
      if (email && Password) {
        const user = await UserModel.findOne({ email: email })
        if (user != null) {
          const isMatch = await bcrypt.compare(Password, user.Password)
          if ((user.email === email) && isMatch)
          {
            // Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.send({ "status": "success", "message": "Login Success", "token": token })
          } else {
            res.send({ "status": "failed", "message": "Email or Password is not Valid" })
          }
        } else {
          res.send({ "status": "failed", "message": "You are not a Registered User" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unable to Login" })
    }
  }
  static changeUserPassword=async(req,res)=>{
    const {Password,password_confirmation}=req.body
    if (Password && password_confirmation) 
    {
      if(Password !== password_confirmation)
      {
       res.send({ "status": "failed", "message": "New Password and Confirm Password doesn't match" })
      }
      else{
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(Password, salt)
        await UserModel.findByIdAndUpdate(req.user._id, { $set: { Password: hashPassword } })
        res.send({ "status": "success", "message": "Password Change Successfuly" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })

    }
  }
  // To delete the data
  static deleteData = async (req, res) => {
    const { _id } = req.body;
    const user = await UserModel.findOne({_id });
    console.log(user)
    if (user == null) {
      res.send({
        "status": "failed",
        "message": "User not found",
      });
      return;
    }
    const remove = await user.deleteOne({ where: {_id } });
    if (remove.deletedCount === {_id}) {
      res.send({
        "status": "success",
        "message": "User deleted successfully",
        "remove": remove,
        "id": user._id,
      });
    } else {
      res.send({
        "status": "failed",
        "message": "User not found",
      });
    }
  };
  // show the data of loggedUser
  static loggedUser = async (req, res) => {
    console.log(req.user)
    res.send({ "user": req.user })
  }
  
  

      // Show all Data 
      static showData = async (req, res) => {
      const users = await UserModel.find()
      // console.log(users)
      res.send({
        "status": "success",
        "message": "All users found",
        "users": users
      })
}
static sendUserPasswordResetEmail=async(req,res)=>{
      const { email }=req.body
      if (email) 
      {
      const user=await UserModel.findOne({email:email})
        if (user)
        {
          const secret=user._id+process.env.JWT_SECRET_KEY 
          const token=jwt.sign({userID:user._id},secret,{expiresIn:'15m'})
          const link=`http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
          // console.log(link)
          // send Email
          let info=await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:user.email,
            subject:"Ramzan = Password Reset Link",
            html:`<a href=${link}>Click here</a> to Reset Your Password`
        })
          res.send({ "status": "Success", "message": "Password Reset Email Sent... Please Check Your Email"});
        } 
        else
        {
          res.send({ "status": "failed", "message": "Email doesn't exists" });

        }
      } 
      else
      {
        res.send({ "status": "failed", "message": "Email Field is Required" });

      }
}
static userPasswordReset = async (req, res) => {
  const { Password, password_confirmation } = req.body
  const { id, token } = req.params
  const user = await UserModel.findById(id)
  const new_secret = user._id + process.env.JWT_SECRET_KEY
  try {
     jwt.verify(token, new_secret)
    if (Password && password_confirmation) {
      if (Password !== password_confirmation) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(Password, salt)
        await UserModel.findByIdAndUpdate(user._id, { $set: { Password: newHashPassword } })
        res.send({ "status": "success", "message": "Password Reset Successfully" })
      }
    } 
    else
     {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  } catch (error) {
    // console.log(error)
    res.send({ "status": "failed", "message": "Invalid Token" })
  }
}
}
export default UserController
