import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:currentUserId}}).select('-password');

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error('Error in getUsersForSidebar controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await  Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getMessages controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const sendMessages = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMwssage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            seen: false,
        });
        await newMwssage.save();

        // realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMwssage);

            const unreadCount = await Message.countDocuments({
                receiverId,
                senderId,
                seen: false,
            });

            io.to(receiverSocketId).emit("unreadCount", {
                from: senderId,
                count: unreadCount,
            });
        }

        res.status(200).json(newMwssage);
    } catch (error) {
        console.error('Error in sendMessage controller:', error);
        res.status(500).json({message: error.message});
    }
}

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: contactId } = req.params; 
    const userId = req.user._id;

    await Message.updateMany(
      { senderId: contactId, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );

    // notify sender that their messages were seen
    const senderSocketId = getReceiverSocketId(contactId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { by: userId });
    }

    res.status(200).json({ succcess: true, message: "Messages marked as seen" });
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    res.status(500).json({success: false, message: error.message });
  }
};

export const getUnreadCountsForUser = async (req, res) => {
    const { userId } = req.params;
  try {
    const result = await Message.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(userId), seen: false } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } }
  ]);

    const counts = {};
    result.forEach(r => {
        counts[r._id.toString()] = r.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    console.error("Error in getUnreadCountsForUser:", error);
    res.status(500).json({ message: error.message });
  }
};