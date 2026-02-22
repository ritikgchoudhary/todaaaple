import mongoose from 'mongoose';

const agentConfigSchema = mongoose.Schema({
    userId: {
        type: Number, // User ID from userSchema
        required: true,
        unique: true
    },
    kycPercentage: {
        type: Number,
        default: 50
    },
    withdrawalPercentage: {
        type: Number,
        default: 50
    },
    upgradePercentage: {
        type: Number,
        default: 50
    },
    isPercentageUpgrade: {
        type: Boolean,
        default: true
    },
    enabledCommissions: {
        type: [String],
        default: ['kyc', 'withdrawal', 'upgrade']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AgentConfig', agentConfigSchema);
