let mongoose = require('mongoose')

let planSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, default: null },
    planName: { type: String, default: null },
    planAddress: { type: String, default: null },
    imageUrl: { type: String, default: null },
    status: { type: String,enum:['active','inactive'], default: 'active' },
    outputGenerated:{type: mongoose.Schema.Types.Mixed,default:null}

}, { timestamps: true })

let planModel = mongoose.model("plan",planSchema)
module.exports = planModel
