import mongoose from "mongoose";

const connectDB = async () => {
    try {
      mongoose.connection.on("connected",()=> console.log("connected to db successfully"))  
      mongoose.connect(process.env.mongodb_URI as string)

    } catch (error) {

        console.log(`error in connecting to db ${error}`)
        
    }
}

export default connectDB;