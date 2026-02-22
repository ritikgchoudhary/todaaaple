import CommissionConfig from '../model/commissionConfig.js';
import AgentConfig from '../model/agentConfig.js';
import CommissionLog from '../model/commissionLog.js';
import User from '../model/userSchema.js';

// --- Master Admin Controllers ---

export const getCommissionConfigs = async (req, res) => {
    try {
        const configs = await CommissionConfig.find();
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateCommissionConfig = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const config = await CommissionConfig.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createCommissionConfig = async (req, res) => {
    try {
        const config = new CommissionConfig(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAgentConfigs = async (req, res) => {
    try {
        const configs = await AgentConfig.find();
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateAgentConfig = async (req, res) => {
    const { userId } = req.params;
    try {
        const config = await AgentConfig.findOneAndUpdate({ userId }, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Affiliate Dashboard Controllers ---

export const getAffiliateStats = async (req, res) => {
    const { id: userId } = req.params;
    try {
        const stats = await CommissionLog.aggregate([
            { $match: { userId: parseInt(userId) } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const user = await User.findOne({ id: parseInt(userId) });

        const logs = await CommissionLog.find({ userId: parseInt(userId) }).sort({ date: -1 }).limit(50);

        res.status(200).json({
            success: true,
            data: {
                stats: stats,
                withdrawableBalance: user.balance, // In a real system, might have a separate commission wallet
                recentLogs: logs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Utility function to calculate and credit commission ---

export const creditCommission = async (type, fromUserId, amount, transactionId) => {
    try {
        const fromUser = await User.findOne({ id: fromUserId });
        if (!fromUser || !fromUser.upLine || fromUser.upLine.length === 0) return;

        // Process up to 2 levels
        for (let level = 1; level <= 2; level++) {
            const parentId = fromUser.upLine[level - 1];
            if (!parentId || parentId === "null") continue;

            const parentUser = await User.findOne({ id: parentId });
            if (!parentUser) continue;

            let commissionAmount = 0;
            let logType = '';

            // 1. Direct Registration Commission (ONLY Level 1 usually, but check level field in config)
            if (type === 'PACKAGE_PURCHASE') {
                const config = await CommissionConfig.findOne({
                    type: 'direct',
                    packagePrice: amount,
                    level: level,
                    isActive: true
                });

                if (config) {
                    commissionAmount = config.isPercentage ? (amount * config.percentage) / 100 : config.amount;
                    logType = level === 1 ? 'Direct Registration' : 'Level 2 Registration';

                    if (commissionAmount > 0) {
                        await User.updateOne({ id: parentId }, { $inc: { balance: commissionAmount } });
                        await new CommissionLog({
                            userId: parentId,
                            fromUserId,
                            fromUserName: fromUser.username || fromUser.phone.toString(),
                            type: logType,
                            amount: commissionAmount,
                            baseAmount: amount,
                            transactionId,
                            level: level
                        }).save();
                    }
                }
            }

            // 2. Agent Specific Commissions (KYC, Withdrawal, Upgrade)
            if (parentUser.isAgent) {
                const agentConfig = await AgentConfig.findOne({ userId: parentId, isActive: true });
                if (!agentConfig) continue;

                let agentComm = 0;
                let agentLogType = '';

                if (type === 'PACKAGE_PURCHASE' && agentConfig.enabledCommissions.includes('upgrade')) {
                    const upgradeConfig = await CommissionConfig.findOne({
                        type: 'agent_upgrade',
                        packagePrice: amount,
                        level: level,
                        isActive: true
                    });

                    if (upgradeConfig) {
                        if (upgradeConfig.isPercentage || agentConfig.isPercentageUpgrade) {
                            const pct = (level === 1) ? (agentConfig.upgradePercentage || upgradeConfig.percentage) : (upgradeConfig.percentage);
                            agentComm = (amount * pct) / 100;
                        } else {
                            agentComm = upgradeConfig.amount;
                        }
                        agentLogType = 'Upgrade';
                    }
                } else if (type === 'KYC_PAYMENT' && agentConfig.enabledCommissions.includes('kyc')) {
                    const kycConfig = await CommissionConfig.findOne({ type: 'agent_kyc', level: level, isActive: true });
                    const pct = kycConfig ? kycConfig.percentage : (level === 1 ? agentConfig.kycPercentage : 0);
                    agentComm = (amount * pct) / 100;
                    agentLogType = 'KYC';
                } else if (type === 'WITHDRAWAL_FEE' && agentConfig.enabledCommissions.includes('withdrawal')) {
                    const withConfig = await CommissionConfig.findOne({ type: 'agent_withdrawal', level: level, isActive: true });
                    const pct = withConfig ? withConfig.percentage : (level === 1 ? agentConfig.withdrawalPercentage : 0);
                    agentComm = (amount * pct) / 100;
                    agentLogType = 'Withdrawal Fee';
                }

                if (agentComm > 0) {
                    await User.updateOne({ id: parentId }, { $inc: { balance: agentComm } });
                    await new CommissionLog({
                        userId: parentId,
                        fromUserId,
                        fromUserName: fromUser.username || fromUser.phone.toString(),
                        type: agentLogType,
                        amount: agentComm,
                        baseAmount: amount,
                        transactionId,
                        level: level
                    }).save();
                }
            }
        }

    } catch (error) {
        console.error("Commission Error:", error);
    }
};

export const reverseCommission = async (transactionId) => {
    try {
        const logs = await CommissionLog.find({ transactionId, status: 'Success' });
        for (const log of logs) {
            await User.updateOne({ id: log.userId }, { $inc: { balance: -log.amount } });
            await CommissionLog.updateOne({ _id: log._id }, { status: 'Reversed' });
        }
        return { success: true };
    } catch (error) {
        console.error("Reversal Error:", error);
        return { success: false, error: error.message };
    }
};
