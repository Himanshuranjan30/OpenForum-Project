const express=require('express')
const mongoose=require('mongoose')
const app= express()
const config=require('./config')



mongoose.connect(config.mongoUri,{ useNewUrlParser: true },()=>{
    console.log('connected to db')
})

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

app.listen(3000)