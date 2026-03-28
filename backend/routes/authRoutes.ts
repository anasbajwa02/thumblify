import express from "express"
import { userLogin, userLogout, UserRegister, userVerify } from "../controllers/AuthController.js"
import protect from "../middleware/auth.js"

const Router = express.Router()

Router.post('/register',UserRegister)
Router.post('/login',userLogin)
Router.post('/logout',protect,userLogout)
Router.get('/verify',protect,userVerify)


export default Router;