const express=require('express')
const mongoose=require('mongoose')
const app= express()
const config=require('./config')
const bodyParser=require('body-parser')
const cookieparser=require('cookie-parser')
const cors=require('cors')
const CURRENT_WORKING_DIR = process.cwd()
app.use(bodyParser.json)
app.use(bodyParser.urlencoded)
app.use(cookieparser())
app.use(cors())


mongoose.connect(config.mongoUri,{ useNewUrlParser: true },()=>{
    console.log('connected to db')
})

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

app.listen(3000)