require('dotenv').config()
const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 80,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
    mongoUri: process.env.MONGODB_URI
  }
  
  module.exports=config