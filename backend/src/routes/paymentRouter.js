import express from 'express';
import { verifyPayment ,createOrder } from '../controllers/payment.comtroller.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

export default router;

// @desc    Update user subscription tier for debugging purposes
// router.put('/tier-debug', protect, updateUserTierDebug);
