let nodemailer = require('nodemailer')
const { promisify } = require('util');



let setOtpUsingNodemailer = async (code, email) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        let mailDetails = {
            from: process.env.GMAIL,
            to: email,
            subject: 'Forget Password OTP',
            text: 'Forget Password OTP',
            html: `<div style='padding:30px; text-align:center; color:black; background-color:skyblue;'> <h2>${code}</h2></div>`
        };

        
        const sendMail = promisify(transporter.sendMail.bind(transporter));

        await sendMail(mailDetails);
        return true
    } catch (error) {
        console.log("ERROR::", error);
        return false
    }
};

module.exports = {
    setOtpUsingNodemailer
};


