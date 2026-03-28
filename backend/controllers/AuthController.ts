// user auth controller 


import { Request, Response } from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";


export const UserRegister = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, genSalt);
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })
        await newUser.save();
        // setting user data in session
        req.session.userId = newUser._id;
        req.session.isLoggedIn = true;
        return  res.status(201).json({ message: "User registered successfully", user: { id: newUser._id, name: newUser.name, email: newUser.email } });  
    } catch (error : any) {
        console.log(error)
        res.status(500).json({ message: "Server error" });
    }
}

// user login

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // setting user data in session
        req.session.userId = user._id;
        req.session.isLoggedIn = true;
        return res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
    } catch (error : any) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

// logout user
export const userLogout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Server error" });
        }
        return res.status(200).json({ message: "Logout successful" });
    }); 
}


// user verify
export const userVerify = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session
        if(!userId){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(401).json({ message: "Unauthorized" });
        }
        return res.status(200).json({ message: "User is authenticated", user });
    } catch (error : any) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}