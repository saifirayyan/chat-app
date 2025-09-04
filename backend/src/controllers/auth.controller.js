import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const {email, fullName, password} = req.body;
    try {
        if(!email || !fullName || !password ){
            return res.status(400).json({message: 'All fields are required'});
        }
        if(password.length < 6) {
            return res.status(400).json('Password must be at least 6 character');
        }
        const user = await User.findOne({email});
            if(user) return res.status(400).json({message: 'Email already exist'});

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword
            });

            if(newUser){
                generateToken(newUser._id, res);
                await newUser.save();

                res.status(201).json({
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                });
            }else{
                res.status(400).json({message: 'Invalid user details'});
            }
    } catch (error) {
        console.error('Error in signup controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        generateToken(user._id, res);
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error('Error in login controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', "", {maxAge:0});
        res.status(200).json({message: 'Logged out successfully'})
    } catch (error) {
        console.error('Error in logout controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic, fullName} = req.body;
        const userId = req.user._id;

        if(fullName){
            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                {fullName}, 
                {new: true}
            );
            return res.status(200).json(updatedUser);
        } 

        if(!profilePic){
            return res.status(400).json({message: 'Profile pic is required'});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {profilePic: uploadResponse.secure_url}, 
            {new: true}
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error in updateProfile controller:', error);
        res.status(500).json({message: error.message});
    }
}



export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error('Error in checkAuth controller:', error);
        res.status(500).json({message: error.message});
    }
}