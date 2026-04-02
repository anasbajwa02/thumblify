import express from "express";
import { getUserThumbnails, getThumbnailsById } from "../controllers/UserController.js";

const UserRouter = express.Router();

UserRouter.get("/thumbnails", getUserThumbnails);
UserRouter.get("/thumbnails/:thumbnailId", getThumbnailsById);

export default UserRouter;