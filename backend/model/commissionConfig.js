import mongoose from 'mongoose';

const commissionConfigSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'agent_kyc', 'agent_withdrawal', 'agent_upgrade'],
        required: true
    },
    packagePrice: {
        type: Number,
        required: function () { return this.type === 'direct' || this.type === 'agent_upgrade'; }
    },
    amount: {
        type: Number, // Fixed amount
    },
    percentage: {
        type: Number, // Percentage (0-100)
    },
    isPercentage: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    level: {
        type: Number,
        default: 1, // 1 for Direct Affiliate, 2 for Affiliate Agent
        enum: [1, 2]
    },
    description: String,
    updatedBy: String,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CommissionConfig', commissionConfigSchema);
