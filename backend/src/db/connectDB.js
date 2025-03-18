import { DB_NAME } from "../constant.js";
import mongoose from "mongoose"

const connectDB = async()=>{
    try{
        const con = await mongoose.connect(`${process.env.MONODB_NAME}/${DB_NAME}`)
        console.log(`DataBase connected`);
    }catch(err){
        console.log(`DataBase Connection Failed ${err}`);
        exit(1);
    }
}

export  { connectDB };