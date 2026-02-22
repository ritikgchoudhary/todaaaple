import User from "../model/userSchema.js";
import Withdrawal from "../model/withdrawal.js";
import Transaction from "../model/transaction.js";
import Daily from "../model/daily.js";
import ErrorResponse from "../utils/error.js";

export const getAdminStats = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const totalUsers = await User.countDocuments();

        // Aggregating total recharges from Transaction model or Daily model
        // Daily model tracks it by date, but let's sum it up
        const dailyData = await Daily.find();
        let totalRecharge = 0;
        let totalWithdrawal = 0;

        dailyData.forEach(d => {
            totalRecharge += d.amount || 0;
            totalWithdrawal += d.redeem || 0;
        });

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: "Pending" });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRecharge,
                totalWithdrawal,
                pendingWithdrawals
            }
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};

export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const users = await User.find({}, {
            id: 1,
            phone: 1,
            balance: 1,
            date: 1,
            block: 1,
            username: 1
        }).sort({ date: -1 }).limit(100);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};

export const updateUserAdmin = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const { userId, balance, block } = req.body;

        const updateData = {};
        if (balance !== undefined) updateData.balance = balance;
        if (block !== undefined) updateData.block = block;

        await User.updateOne({ id: userId }, updateData);

        res.status(200).json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};
