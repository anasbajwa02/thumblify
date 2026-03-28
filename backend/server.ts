import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/authRoutes.js";


declare module "express-session" {
    interface SessionData {
        userId: string;
        isLoggedIn: boolean;
    }
}




await connectDB()

const app = express();

// Middleware
app.use(cors(
   {
    origin:"*",
    credentials:true,
   }
))
app.use(express.json());

app.use(session(
    {
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie:{maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 day
        store:MongoStore.create({
            mongoUrl: process.env.mongodb_URI as string,
            collectionName:"sessions"
        })


    }
))

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth', authRoutes);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});