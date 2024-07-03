let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let otpGenerator = require("otp-generator")



let generateEncryptedPassword = async (password) => {
    try {
        let salt = await bcrypt.genSalt(10)
        let passhash = await bcrypt.hash(password, salt)
        return passhash
    } catch (error) {
        console.log("ERROR::", error)
    }
}


let comparePassword = async (enteredPassword, hashedPassword) => {
    try {
        let isPasswordMatched = bcrypt.compare(enteredPassword, hashedPassword)
        return isPasswordMatched
    } catch (error) {
        console.log("ERROR::", error)
    }
}


let generateToken = async (userId) => {
    try {
        let token = await jwt.sign({
            id: userId
        }, process.env.SECRET_KEY)
        return token
    } catch (error) {
        console.log("ERROR::", error)
    }
}



let generateOTP = async () => {
    try {
        let code = await otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        return code
    } catch (error) {
        console.log('ERROR::', error)
    }
}

module.exports = {
    generateEncryptedPassword,
    comparePassword,
    generateToken,
    generateOTP
}