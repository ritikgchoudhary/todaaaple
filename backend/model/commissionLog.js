import mongoose from 'mongoose';

const commissionLogSchema = mongoose.Schema({
    userId: {
        type: Number, // The one who receives the commission
        required: true,
        index: true
    },
    fromUserId: {
        type: Number, // The one who performed the action
        required: true
    },
    fromUserName: String,
    type: {
        type: String,
        enum: ['Direct Registration', 'Level 2 Registration', 'KYC', 'Withdrawal Fee', 'Upgrade'],
        required: true,
        index: true
    },
    amount: {
        type: Number, // Commission earned
        required: true
    },
    baseAmount: {
        type: Number, // Original transaction amount
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['Success', 'Pending', 'Failed', 'Reversed'],
        default: 'Success'
    },
    date: {
        type: Date,
        default: Date.now
    },
    level: {
        type: Number,
        default: 1
    }
});

export default mongoose.model('CommissionLog', commissionLogSchema);
