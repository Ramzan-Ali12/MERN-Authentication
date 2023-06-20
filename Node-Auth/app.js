import dotenv from 'dotenv'
dotenv.config()
import  express, { json }  from 'express'
import cors from 'cors';
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js';
const app=express()
const port=process.env.PORT
const DATBASE_URL=process.env.DATBASE_URL
app.use(cors())
// Database connection
connectDB(DATBASE_URL)
// Json
app.use(express.json())
// Load Routes
app.use("/api/user",userRoutes)
app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`)
})