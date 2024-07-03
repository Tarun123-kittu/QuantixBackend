let express = require('express')
let app = express()
let connectDB = require('./src/config/dbConfig')
let v1Route = require('./src/routes/v1Routes')
let cors = require('cors')
let fileUpload= require('express-fileupload')



app.use(cors())
app.use(cors({
    origin: '*'
}))
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 
    req.on('close', () => {
        res.end();
    });
});


app.use('/api/v1/', v1Route)
connectDB()


app.listen(process.env.PORT, () => console.log('backend is running...'))