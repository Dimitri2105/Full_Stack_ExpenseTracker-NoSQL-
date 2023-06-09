const path = require("path");
const fs = require('fs');
const bcrypt = require("bcrypt");
const User = require("../modals/userModal");
const ForgetPassword = require("../modals/forgetPasswordModal");

const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

exports.forgetPassword = async (req, res, next) => {
  try {
    sgMail.setApiKey(process.env.API_KEY);
    const email = req.body.emailAdd;
    const user = await User.findOne({ email: req.body.emailAdd } );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const newForgotPassword = new ForgetPassword({
      active: true,
      expiresby: new Date(),
      userId:user._id
    });

    const id =  newForgotPassword._id.toString();  
    await newForgotPassword.save()
    const message = {
      to: email,
      from: "karanthakur577@gmail.com",
      subject: "Password Reset",
      text: "Click on below link to reset password",
      html: `<a href="http://localhost:8000/password/resetpassword/${id}">Reset password</a>`,
    };
    const result = await sgMail.send(message);

    console.log("id >>>>>>>>",id)

    res.status(200).json({message: "Password reset email sent",success:true,id});

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

exports.resetPassword = async (req, res, next) => {
  try{
    const forgetPasswordId =  req.params.id;
    const forgotPasswordRequest = await ForgetPassword.findOne({_id:forgetPasswordId})
    console.log("forgotPasswordRequest >>>>>" , forgotPasswordRequest)
    if(forgotPasswordRequest)
    {
      await ForgetPassword.updateOne({_id:forgetPasswordId} , { active: false});
  
      const filePath = path.join(__dirname, '..', 'views', 'resetPassword', 'resetPassword.html');
      console.log('filePath>>>>>>>>>>>', filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error loading file');
        }
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(data);
      });
      }
  }catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
  
  }

exports.updatePassword = async(req,res,next) =>{
  console.log("inside update Password >>>>>>>>.")
  try{
    const resetId = req.params.id;
    const password = req.body.passwordAdd;

    if(!req.params.id){
      res.status(400).json({message:"Reset Password ID missing"})
    }
    const forgotPasswordRequest =  await ForgetPassword.findOne( {_id : resetId} )
    console.log("forgotPasswordRequest>>>>>>>>>>>>>>>>",forgotPasswordRequest)
    const userRequest = await User.findOne({ _id:forgotPasswordRequest.userId })
    console.log("userRequest>>>>>>>>>>>>>>>>>>>>",userRequest)
    if(userRequest){
      const saltRound = 10;
      bcrypt.hash(password,saltRound,async(error,hash) =>{
        if(error){
          console.log(error);
          throw new Error(error);
        }
    await User.updateOne({_id:userRequest.id} , {password: hash})
    res.status(201).json({message: 'Successfuly update the new password'})})
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }

}