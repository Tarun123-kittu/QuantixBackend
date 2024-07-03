let mongoose = require('mongoose')
let planModel = require("../models/planModel")
const OpenAI = require('openai');
const fs = require('fs')
const path = require('path')


let AWS = require('../utils/awsUpload')


const openai = new OpenAI({
    apiKey: process.env.CHATGPT_KEY,
});



exports.addPlans = async (req, res) => {
    try {
     
        let userId = req.result.id;
        let { planName, planAddress } = req.body;
        let planImage = '';

             if(req.files===null){return res.status(400).json({message:"Please add Image",type:'error'}) }

             let img = req.files.planImage
             if (img.mimetype === "image/jpeg" || img.mimetype === "image/png" || img.mimetype === "image/jpg") {
             const planImagePath = `planImage/${userId}`;
             const contentType = img.mimetype;
             const url = await AWS.uploadS3(img, planImagePath, contentType);
             planImage = url;
             } else {
             return res.status(400).json({ message: "This file format not allowed. You can only add images having extensions :jpeg,png,jpg ." })
             }

        const file = await openai.files.create({
            file: fs.createReadStream(path.join(__dirname, '../public/csv', 'costing.xlsx')),
            purpose: "assistants",
        });

        const assistant = await openai.beta.assistants.create({
            name: "Quanti",
            description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
            instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
            model: "gpt-4o",
            tools: [{ "type": "code_interpreter" }],
            tool_resources: {
                "code_interpreter": {
                    "file_ids": [file.id]
                }
            }
        });

        const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "use pricing from uploaded spreadsheet file, please analyse the house plan pixel to pixel each dimension should be correct as mentioned in the image. Don't give output like chat just a professional output for which you are trained for."
                        },
                        {
                            "type": "image_url",
                            "image_url": { "url": planImage }
                        }
                    ]
                }
            ]
        });

        var accumulatedData =''

        const run = openai.beta.threads.runs.stream(thread.id, {
            assistant_id: assistant.id
        })
            .on('textCreated', (text) => {
                process.stdout.write('\nassistant > ');
                // res.write(`data: ${text}\n\n`);
                // accumulatedData.push(text)

            })
            .on('textDelta', (textDelta, snapshot) => {
                process.stdout.write(textDelta.value);
                res.write(textDelta.value);
                accumulatedData += textDelta.value; 
            })
     
            .on('end', async() => {
                let planObj = {
                    userId: userId,
                    planName: planName,
                    planAddress: planAddress,
                    imageUrl: planImage,
                    outputGenerated: accumulatedData
                }
                await planModel.create(planObj)
                res.end();
                // console.log('Accumulated Data:', accumulatedData);
            });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error", error: error.message });
    }
};






exports.deletePlan = async (req, res) => {
    try {
        let planId = req.query.planId;

        let isPlanExist = await planModel.findOne({ _id: planId })
        if (!isPlanExist) { return res.status(400).json({ message: "No plan exist with this id", type: "error" }) }

        await planModel.findOneAndDelete({ _id: planId })

        return res.status(200).json({ message: isPlanExist.planName + " plan deleted successfully.", type: 'success' })

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
    }
}




exports.getAllPlans = async (req, res) => {
    try {
        const columnMapping = {
            "PLAN NAME": "planName",
            "PLAN ADDRESS": "planAddress",
            "STATUS": "status",
            "CREATED AT": "createdAt"
        };

        const { page = 1, limit = 10, search = '', sortOrder = 'desc', column = 'createdAt' } = req.query;
        const userId = req.result.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) { 
            return res.status(400).json({ message: 'Invalid user ID', type: 'error' }); 
        }

        const sortColumn = columnMapping[column.toUpperCase()] || 'createdAt';

        const matchStage = {
            $match: {
                $and: [
                    { userId: new mongoose.Types.ObjectId(userId) },
                    {
                        $or: [
                            { planName: { $regex: search, $options: 'i' } },
                            { planAddress: { $regex: search, $options: 'i' } },
                            { status: { $regex: search, $options: 'i' } }
                        ].filter(Boolean)
                    }
                ]
            }
        };

        const sortStage = {
            $sort: {
                [sortColumn]: sortOrder === 'asc' ? 1 : -1
            }
        };

        const facetStage = {
            $facet: {
                data: [
                    { $skip: (page - 1) * limit },
                    { $limit: parseInt(limit, 10) }
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        };

        const aggregationPipeline = [matchStage, sortStage, facetStage];

        const allPlans = await planModel.aggregate(aggregationPipeline);

        const plans = allPlans[0].data;
        const totalCount = allPlans[0].totalCount[0] ? allPlans[0].totalCount[0].count : 0;

        res.status(200).json({
            plans,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page, 10),
            type: 'success'
        });
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
}



exports.get_plan_estimates = async (req ,res) => {
try {
    const plan_id = req.query.planId
    let isPlanExist = await planModel.findOne({ _id: plan_id })
    if (!isPlanExist) { return res.status(400).json({ message: "No plan exist with this id", type: "error" }) }
    return res.status(200).json({ data: isPlanExist, type: 'success' })

} catch (error) {
    console.log('ERROR::', error)
    return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
}
}


