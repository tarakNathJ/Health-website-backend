// import Payment from '../models/Payment.module.js'
// import User from '../models/User.js';
// import razorpay from '../utils/razorpayinstance.js';
// import Subscription from '../models/subscription.module.js';
// import  crypto from 'crypto-js'
// import dotenv from 'dotenv';
// dotenv.config();



// export const createOrder = async (req, res) => {
//     const { amount, duration ,plain   } = req.body;

//     try {
//         console.log('Creating order with amount:', amount, 'duration:', duration, 'plan:', plain);
//         // Create a new order in Razorpay
//         const options = {
//             amount: amount * 100, // Amount in paise
//             currency: 'INR',
//             receipt: `receipt_${Date.now()}`,
//             payment_capture: 1 // Auto capture payment
//         };

//         // Validate the request body
//         if (!amount || !currency || !duration || !plain) {
//             return res.status(400).json({ success: false, message: 'Missing required fields' });
//         }
//         // Check if the user is authenticated
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({ success: false, message: 'User not authenticated' });
//         }
//         // Check if the user exists in the database
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }
//         // Create the order in Razorpay
//         if (amount <= 0) {
//             return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
//         }

//         const order = await razorpay.orders.create(options);

//         // Save the order details in the database
//         const payment = new Payment({
//             userId: req.user._id,
//             amount,
//             currency: "INR",
//             OrderId: order.id,
//             status: 'pending'
//         });
//         await payment.save();

//         // Check if the payment record was created successfully
//         if (!payment) {
//             return res.status(500).json({ success: false, message: 'Failed to create payment record' });
//         }

//         const subscription = new Subscription({
//             userId: req.user._id,
//             plan: plain, // Assuming 'plain' is the plan type
//             startDate: new Date(),
//             endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // duration in days
//             status: 'inactive',
//             paymentId: payment._id
//         });
//         await subscription.save();
//         // Check if the subscription record was created successfully
//         if (!subscription) {
//             return res.status(500).json({ success: false, message: 'Failed to create subscription record' });
//         }   
        

        

//         res.status(200).json({
//             success: true,
//             order,
//             paymentId: payment._id,
//             subscriptionId: subscription._id,
//             message: 'Order created successfully'
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create order',
//             error: error.message
//         });
//     }
// }

// export const verifyPayment = async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature ,paymentId ,subscriptionId } = req.body;
   

//     try {
//         // Validate the request body
//         if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId || !subscriptionId) {
//             return res.status(400).json({ success: false, message: 'Missing required fields' });
//         }

//         // Fetch the payment from the database
//         const payment = await Payment.findById(paymentId);
//         if (!payment) {
//             return res.status(404).json({ success: false, message: 'Payment not found' });
//         }
//         // Check if the payment is already completed
//         if (payment.status === 'completed') {
//             return res.status(400).json({ success: false, message: 'Payment already completed' });
//         }
//         // Check if the payment ID matches the order ID
//         if (payment.OrderId !== razorpay_order_id) {
//             return res.status(400).json({ success: false, message: 'Payment ID does not match order ID' });
//         }
//         // chack subscriptionId
//         const subscriptions = await Subscription.findById(subscriptionId);
//         if (!subscriptions) {
//             return res.status(404).json({ success: false, message: 'Subscription not found' });
//         }
//         // Check if the subscription is already active
//         if (subscriptions.status === 'active') {
//             return res.status(400).json({ success: false, message: 'Subscription already active' });
//         }


//         // Verify the payment signature
//         const generatedSignature = crypto.HmacSHA256(`${razorpay_order_id}|${razorpay_payment_id}`, process.env.RAZORPAY_SECRET).toString();

//         if (generatedSignature !== razorpay_signature) {
//             return res.status(400).json({ success: false, message: 'Invalid signature' });
//         }

//         // Update the payment status to completed
//         payment.paymentId = razorpay_payment_id;
//         payment.status = 'completed';
//         payment.signature = razorpay_signature;
//         await payment.save();

//         // Create a subscription for the user
//         subscriptions.status = 'active'; // Set the subscription status to active
//         subscriptions.paymentId = payment._id; // Link the payment to the subscription
//         subscriptions.startDate = new Date(); // Set the start date to now
//         await subscriptions.save();

//         const UpdateUser = await User.findByIdAndUpdate(
//             req.user._id,
//             { tier: subscriptions.plan }, // Update the user's tier based on the subscription plan
//             { new: true }
//         );
//         // Check if the user was updated successfully
//         if (!UpdateUser) {
//             return res.status(500).json({ success: false, message: 'Failed to update user plan' });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Payment verified and subscription created successfully',
//             tier: subscriptions.plan,
//         });
//     } catch (error) {
//         console.error('Error verifying payment:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to verify payment',
//             error: error.message
//         });
//     }
// }


// backend/src/controllers/payment.controller.js

// 1. IMPORT NATIVE CRYPTO: Use Node.js's built-in crypto module. It's standard and more efficient.
import crypto from 'crypto';

import Payment from '../models/Payment.module.js';
import User from '../models/User.js';
import razorpay from '../utils/razorpayinstance.js';
import Subscription from '../models/subscription.module.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @desc    Create a new Razorpay order and save initial records in the database.
 * @route   POST /api/payment/create-order
 * @access  Private (Requires user to be logged in)
 */
export const createOrder = async (req, res) => {
    // Corrected variable name from 'plain' to 'plan' for clarity
    const { amount, duration, plan } = req.body;

    try {
        // --- VALIDATION BLOCK ---
        // Group all validation at the beginning for a clean "fail-fast" approach.
        console.log('Creating order with amount:', amount, 'duration:', duration, 'plan:', plan);
        // Validate the request body
        // 2. FIX: Removed the '!currency' check which caused the original error.
        if (!amount || !duration || !plan) {
            return res.status(400).json({ success: false, message: 'Missing required fields: amount, duration, and plan are required.' });
        }

        // Validate the amount
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        }

        // Check if the user is authenticated (assuming your 'protect' middleware handles this)
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Check if the user exists in the database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // --- LOGIC BLOCK ---
        console.log('Creating order with amount:', amount, 'duration:', duration, 'plan:', plan);

        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        // Save the payment details in our database
        const payment = new Payment({
            userId: req.user._id,
            amount: amount,
            currency: "INR",
            OrderId: order.id, // Use camelCase 'orderId' for convention
            status: 'pending',
        });
        await payment.save();

        // 3. IMPROVEMENT: Removed redundant 'if (!payment)' check. The catch block will handle save errors.

        // Create a corresponding subscription record
        const subscription = new Subscription({
            userId: req.user._id,
            plan: plan,
            endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // duration in days
            status: 'inactive', // Will be activated upon successful payment
            paymentId: payment._id,
        });
        await subscription.save();
        
        // 4. IMPROVEMENT: Removed redundant 'if (!subscription)' check.

        res.status(200).json({
            success: true,
            order,
            paymentId: payment._id,
            subscriptionId: subscription._id,
            message: 'Order created successfully',
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
        });
    }
};

/**
 * @desc    Verify payment signature and activate subscription.
 * @route   POST /api/payment/verify
 * @access  Private (Requires user to be logged in)
 */
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, subscriptionId } = req.body;

    console.log('Verifying payment with order ID:', razorpay_order_id, 'payment ID:', razorpay_payment_id, 'signature:', razorpay_signature, 'paymentId:', paymentId, 'subscriptionId:', subscriptionId);
   
    try {
        // --- VALIDATION BLOCK ---
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId || !subscriptionId) {
            return res.status(400).json({ success: false, message: 'Missing required fields for verification' });
        }
        
        // This route must be protected to get req.user
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription record not found' });
        }
        
        // --- LOGIC BLOCK ---

        // 5. IMPROVEMENT: Use the native crypto module for signature verification.
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare signatures
        if (expectedSignature !== razorpay_signature) {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
        }

        // --- SUCCESS: SIGNATURE IS VALID ---
        
        // Update payment status to completed
        payment.paymentId = razorpay_payment_id;
        payment.status = 'completed';
        payment.signature = razorpay_signature;
        await payment.save();

        // Update subscription to active
        subscription.status = 'active';
        subscription.startDate = new Date(); // Set start date to now
        await subscription.save();

        // Update user's plan/tier
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { tier: subscription.plan }, // Update the user's tier based on the subscription plan
            { new: true } // Return the updated document
        );

        console.log('Updated user:', updatedUser);
        if (!updatedUser) {
            // This is an edge case, but good to handle
            return res.status(500).json({ success: false, message: 'Failed to update user plan' });
        }
            
        res.status(200).json({
            success: true,
            message: 'Payment verified and subscription activated successfully',
            tier: subscription.plan,
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message,
        });
    }
};