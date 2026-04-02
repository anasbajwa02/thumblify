import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";



export const getUserThumbnails = async (req: Request, res: Response) => {
    try {
         const { userId } = req.session;
         const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });
         res.json({
            thumbnails
         })
    } catch (error: any) {
        console.log(error)

        res.status(500).json({ message: "Failed to fetch thumbnails", error: error.message });

        
    }
}


//

export const getThumbnailsById = async (req: Request, res: Response) => {
    try {
         const { userId } = req.session;
         const { thumbnailId } = req.params;
         const thumbnails = await Thumbnail.find({ userId, _id: thumbnailId })
         res.json({
            thumbnails
         })
    } catch (error: any) {
        console.log(error)

        res.status(500).json({ message: "Failed to fetch thumbnails", error: error.message });

        
    }
}
