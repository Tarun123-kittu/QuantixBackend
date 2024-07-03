let mongoose = require('mongoose')
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `../../env/.${process.env.NODE_ENV}.env`)
});


let connectDB = async (req, res) => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('DB connected ...')
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json({ message: "Something went wrong.", type: "error", error: error.message })
    }
}

module.exports = connectDB

