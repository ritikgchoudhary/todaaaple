import User from "../model/userSchema.js";
import Withdrawal from "../model/withdrawal.js";
import Transaction from "../model/transaction.js";
import Daily from "../model/daily.js";
import With from "../model/withdrawal.js";
import promotion from "../model/promotion.js";
import { creditCommission } from "./commission.js";
import ErrorResponse from "../utils/error.js";

export const getAdminStats = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ block: false });
        
        // Sum of all user balances
        const users = await User.find({}, { balance: 1 });
        let totalBalances = 0;
        users.forEach(u => totalBalances += (u.balance || 0));

        // Aggregating total recharges/withdrawals from Daily model
        const dailyData = await Daily.find();
        let totalRecharge = 0;
        let totalWithdrawal = 0;

        dailyData.forEach(d => {
            totalRecharge += d.amount || 0;
            totalWithdrawal += d.redeem || 0;
        });

        // Today's data
        const date = new Date();
        const localDate = (date / 1000 + 19800) * 1000;
        const newDatefor = new Date(localDate);
        const day = newDatefor.getDate();
        const month = newDatefor.getMonth() + 1;
        const year = newDatefor.getFullYear();
        const daySorted = day < 10 ? `0${day}` : `${day}`;
        const monthSorted = month < 10 ? `0${month}` : `${month}`;
        const todayKey = `${daySorted}-${monthSorted}-${year}`;
        
        const todayDoc = await Daily.findOne({ id: todayKey });
        const todaysRecharge = todayDoc ? (todayDoc.amount || 0) : 0;
        const todaysWithdrawal = todayDoc ? (todayDoc.redeem || 0) : 0;

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: "Pending" });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalRecharge,
                totalWithdrawal,
                todaysRecharge,
                todaysWithdrawal,
                totalBalances,
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

export const getAllWithdrawalsAdmin = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const withdrawals = await With.find({}).sort({ date: -1 }).limit(200);

        res.status(200).json({
            success: true,
            data: withdrawals
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};

export const updateWithdrawalAdmin = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const { _id, status, amount, userId, id } = req.body;

        if (status === "Success") {
            // Approval Logic
            await User.updateOne(
                { id: parseInt(userId) },
                {
                    $push: {
                        walletHistory: {
                            credit: false,
                            amount: amount,
                            note: `Redeem Successful ID: ${id}`,
                            date: Date.now(),
                        },
                    },
                }
            );
            await With.updateOne({ _id: _id }, { status: status });

            // Commission Credit (if any)
            const withdrawalDoc = await With.findById(_id);
            if (withdrawalDoc && withdrawalDoc.withdrawalFee > 0) {
                await creditCommission('WITHDRAWAL_FEE', parseInt(userId), withdrawalDoc.withdrawalFee, id);
            }

            // Daily Stats Update
            const date = new Date();
            const localDate = (date / 1000 + 19800) * 1000;
            const newDatefor = new Date(localDate);
            const day = newDatefor.getDate();
            const month = newDatefor.getMonth() + 1;
            const year = newDatefor.getFullYear();
            const dayMonth = `${day}/${month}/${year}`;
            
            const daySorted = day < 10 ? `0${day}` : `${day}`;
            const monthSorted = month < 10 ? `0${month}` : `${month}`;
            const newDate = `${daySorted}-${monthSorted}-${year}`;

            await Daily.updateOne(
                { id: newDate },
                { $inc: { redeem: amount, redeemCount: +1 } },
                { upsert: true }
            );

            // Promotion Stats Update
            const user = await User.findOne({ id: userId });
            if (user && user.upLine) {
                const userDate = new Date(user.date);
                const userDateLocal = (userDate / 1000 + 19800) * 1000;
                const newuserDate = new Date(userDateLocal);
                const userdayMonth = `${newuserDate.getDate()}/${newuserDate.getMonth() + 1}/${newuserDate.getFullYear()}`;

                for (let i = 0; i < 7; i++) {
                    if (user.upLine[i]?.length > 0) {
                        const updateObj = { [`level${i}.${user.phone}.totalWithdrawal`]: parseInt(amount) };
                        if (dayMonth === userdayMonth) {
                            updateObj[`newlevel${i}.${dayMonth}.${user.phone}.todayWithdrawal`] = parseInt(amount);
                        }
                        await promotion.updateOne({ userId: user.upLine[i] }, { $inc: updateObj }, { upsert: true });
                    }
                }
            }
        } else {
            // Rejection/Fail Logic - Refund balance
            await User.updateOne(
                { id: parseInt(userId) },
                { $inc: { balance: parseInt(amount) } }
            );
            await With.updateOne({ _id: _id }, { status: status });
        }

        res.status(200).json({
            success: true,
            message: `Withdrawal ${status} successfully`
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};

export const getAdminTransactions = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }

        const transactions = await Transaction.find({}).sort({ date: -1 }).limit(100);

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};
