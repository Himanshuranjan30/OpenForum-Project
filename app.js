const express=require('express')
const mongoose=require('mongoose')
const app= express()
const config=require('./config')
const bodyParser=require('body-parser')
const cookieparser=require('cookie-parser')
const cors=require('cors')
const path=require('path')
const userRoutes=require('./routes/userroutes')
const authRoutes=require('./routes/authroutes')
const postRoutes=require('./routes/postroutes')
const CURRENT_WORKING_DIR = process.cwd()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(express.static(__dirname +'/assets'));



mongoose.connect(config.mongoUri,{ useNewUrlParser: true },()=>{
    console.log('connected to db')
})
mongoose.set('useFindAndModify', false);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)

app.use('/hey',(req,res)=>{
  print(req.body)
  res.json(req.body)
})
app.listen(3000)