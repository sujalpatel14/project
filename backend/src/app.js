import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin.routes.js'
import studentRoutes from './routes/student.routes.js'
import path from "path"; 

const app = express();

app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(cookieParser());
app.use(cors({
    origin: " http://192.168.88.21:5173", 
    credentials: true,               
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
}))
app.use(bodyParser.json());
app.use("/images", express.static(path.join(process.cwd(), "src/certificates/assets/images")));


app.use("/api/admin",adminRoutes)
app.use("/api/student",studentRoutes)

export { app };