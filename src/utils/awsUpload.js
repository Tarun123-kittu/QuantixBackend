let AWS = require("aws-sdk")


module.exports.uploadS3 = (file, folder, contentType) => {

    return new Promise(async (resolve, reject) => {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
        const filename = file.name;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: folder + "/" + filename,
            Body: file.data,
            ACL: 'public-read',
            ContentType: contentType,
        };
        await s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                return reject(s3Err)
            }
            return resolve(data.Location)
        });
    })
}