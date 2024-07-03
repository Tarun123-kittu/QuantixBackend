let userModel = require('../models/userModel')
let { generateEncryptedPassword, comparePassword, generateToken, generateOTP } = require("../utils/commonFunctions")
let { setOtpUsingNodemailer } = require("../utils/nodemailer")
let bcrypt = require('bcrypt')



exports.testRoute = async (req, res) => { res.send('test route successfull..') }


exports.signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let isUsernameAlreadyExist = await userModel.findOne({ username });
        if (isUsernameAlreadyExist) { return res.status(400).json({ message: "This username is already taken. Please try with another username.", type: 'error' }); }

        let isEmailAlreadyExist = await userModel.findOne({ email });
        if (isEmailAlreadyExist) { return res.status(400).json({ message: "This email is already taken. Please try with another email.", type: 'error' }); }

        let hashedPassword = await generateEncryptedPassword(password);
        let userDetailsObj = {
            username,
            email,
            password: hashedPassword
        };

        await userModel.create(userDetailsObj);
        return res.status(200).json({ message: "User registered successfully.", type: 'success' });
    } catch (error) {
        console.log('ERROR:: ', error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};



exports.signIn = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        let isUserExist = await userModel.findOne({ $or: [{ 'username': usernameOrEmail }, { 'email': usernameOrEmail }] });
        if (!isUserExist) { return res.status(400).json({ message: "User doesn't exist with this username or email.", type: 'error' }); }

        let isPasswordMatched = await comparePassword(password, isUserExist.password);
        if (!isPasswordMatched) { return res.status(400).json({ message: "Password doesn't match.", type: 'error' }); }

        let token = await generateToken(isUserExist._id);
        let userObj = isUserExist.toObject();
        userObj.token = token;

        await userModel.findOneAndUpdate({email:isUserExist.email},{$set:{token:token}})

        return res.status(200).json({ message: 'Logged in successfully.', type: 'success', userObj });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};



exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json({ message: "This email is not registered.", type: 'error' }); }

        let code = await generateOTP();
        let nodemailerResponse = await setOtpUsingNodemailer(code, email);
        if (!nodemailerResponse) { return res.status(400).json({ message: "Something went wrong while sending email using nodemailer.", type: 'error' }); }

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                forgetPasswordOtp: code,
                forgetPasswordOtpSentAt: new Date()
            }
        });

        return res.status(200).json({ message: `OTP has been sent to your email ${email}. Valid for 2 minutes.`, type: 'success' });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};



exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json({ message: "This email is not registered.", type: 'error' }); }

        var OTP_created_At = new Date(isEmailExist.forgetPasswordOtpSentAt);
        let current_Time = new Date();
        let otp_time = parseInt(Math.abs(current_Time.getTime() - OTP_created_At.getTime()) / 1000);
        if (otp_time > 120) { return res.status(400).json({ message: "OTP expired", type: 'error' }); }

        if (!(isEmailExist.forgetPasswordOtp === otp)) { return res.status(400).json({ message: "You are entering incorrect OTP", type: 'error' }); }

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                forgetPasswordOtp: null,
                forgetPasswordOtpVerified: true
            }
        });
        return res.status(200).json({ message: "OTP verified successfully.", type: 'success' });
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        let isEmailExist = await userModel.findOne({ email });
        if (!isEmailExist) { return res.status(400).json({ message: "This email is not registered.", type: 'error' }); }

        if (!(isEmailExist.forgetPasswordOtpVerified === true)) { return res.status(400).json({ message: "You cannot change password without otp verification." }) }
        let hashedPassword = await generateEncryptedPassword(password);

        await userModel.findOneAndUpdate({ email }, {
            $set: {
                password: hashedPassword
            }
        });

        return res.status(200).json({ message: "Password reset successfully.", type: 'success' });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
};




exports.socialLogin = async (req, res) => {
    try {
        const { providerName, providerId, email } = req.body;

        let user = await userModel.findOne({
            email: email,
            'socialLogin.providerName': providerName,
            'socialLogin.providerId': providerId
        });

        if (!user) {
            let isUserExistwithThisEmail = await userModel.findOne({ email: email });
            if (isUserExistwithThisEmail) {
                user = await userModel.findOneAndUpdate({ email: email }, {
                    $push: {
                        socialLogin: {
                            providerName: providerName,
                            providerId: providerId
                        }
                    }
                }, { new: true });
            } else {
                user = new userModel({
                    email: email,
                    password:"demopAssword",
                    socialLogin: [{
                        providerName: providerName,
                        providerId: providerId,
                       
                    }]
                });

                await user.save();
            }
        }

        const token = await generateToken(user._id);

        return res.status(200).json({ message: "LoggedIn", type: "success", token: token });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: "Internal Server Error.", type: "error", error: error.message });
    }
};




exports.changePassword = async(req,res)=>{
    try{
      let id = req.result.id;
      let password = req.body.password;
      let newPassword = req.body.newPassword

      let userDetails = await userModel.findOne({_id:id})
      if(!userDetails){return res.status(400).json({message:"loggedIn user not found",type:"error"})}

      let isPassCorrect = await bcrypt.compare(password,userDetails.password)
      if(!isPassCorrect){return res.status(400).json({message:"Entered current password is not correct",type:"error"})}
    
      let salt = await bcrypt.genSalt(10);
      let passhash = await bcrypt.hash(newPassword, salt)
      await userModel.findOneAndUpdate({ _id: id }, {
          $set: {
            password: passhash,
          }
      })
      return res.status(200).json({message:"Password changed successfully.",type:"success"})
    }catch(error){
        console.log("ERROR",error)
        return res.status(500).json({message:"Internal server error",type:"error",error:error.message})
    }
}