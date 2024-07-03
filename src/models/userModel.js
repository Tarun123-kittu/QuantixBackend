let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    username: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    forgetPasswordOtp: { type: Number, default: null },
    forgetPasswordOtpVerified: { type: Boolean, default: false },
    forgetPasswordOtpSentAt: { type: Date, default: null },
    socialLogin: [
        {
            providerName: { type: String, enum: ["google", "twitter", "facebook"] },
            providerId: { type: String, default: null }
        },
    ],
    token:{type:String,default:null}
}, { timestamps: true })

let userModel = mongoose.model('user', userSchema)
module.exports = userModel