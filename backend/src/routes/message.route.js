import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUnreadCountsForUser, getUsersForSidebar, markMessagesAsSeen, sendMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users",protectRoute, getUsersForSidebar);
router.put('/seen/:id', protectRoute, markMessagesAsSeen);
router.post('/send/:id', protectRoute, sendMessages); 
router.get('/unread-counts/:userId', protectRoute, getUnreadCountsForUser);

router.get('/:id', protectRoute, getMessages);



export default router;