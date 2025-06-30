import mongoose from "mongoose"; 


const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        plan: {
            type: String,
            enum: ['free', 'lite', 'pro'],
            default: 'free'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'cancelled'],
            default: 'active'
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            required: true
        },
        
    },
    {
        timestamps: true
    }
);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;