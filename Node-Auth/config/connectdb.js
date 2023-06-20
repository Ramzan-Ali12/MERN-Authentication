
import mongoose from "mongoose";
const connectDB=async (DATBASE_URL)=>{
    try {
        const DB_OPTIONS = {
            dbName: "Node"
          }
    await mongoose.connect(DATBASE_URL,DB_OPTIONS)
    console.log(`MongoDB connected : ${mongoose.connection.host}`);
} catch (error) {
        console.log(error)
    }
}
export default connectDB