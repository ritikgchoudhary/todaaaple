import User from "../model/userSchema.js";
import Withdrawal from "../model/withdrawal.js";
import Transaction from "../model/transaction.js";
import Daily from "../model/daily.js";
import With from "../model/withdrawal.js";
import promotion from "../model/promotion.js";
import offerBonus from "../model/offerBonus.js";
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

        // Dates for Today and Yesterday
        const date = new Date();
        const localDate = (date / 1000 + 19800) * 1000;
        const now = new Date(localDate);
        
        const formatId = (d) => {
            const day = d.getDate();
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        };

        const todayKey = formatId(now);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayKey = formatId(yesterday);

        const todayDoc = await Daily.findOne({ id: todayKey });
        const yesterdayDoc = await Daily.findOne({ id: yesterdayKey });

        // New Users Today
        const startOfToday = new Date(now);
        startOfToday.setHours(0,0,0,0);
        const newUsersToday = await User.countDocuments({ date: { $gte: startOfToday } });

        // Total aggregates
        const allDaily = await Daily.find();
        let totalRecharge = 0;
        let totalWithdrawal = 0;
        allDaily.forEach(d => {
            totalRecharge += d.amount || 0;
            totalWithdrawal += d.redeem || 0;
        });

        const pendingWithdrawals = await Withdrawal.countDocuments({ status: "Pending" });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                newUsersToday,
                totalBalances,
                pendingWithdrawals,
                today: {
                    recharge: todayDoc ? (todayDoc.amount || 0) : 0,
                    withdrawal: todayDoc ? (todayDoc.redeem || 0) : 0,
                    rechargeCount: todayDoc ? (todayDoc.count || 0) : 0,
                    withdrawalCount: todayDoc ? (todayDoc.redeemCount || 0) : 0
                },
                yesterday: {
                    recharge: yesterdayDoc ? (yesterdayDoc.amount || 0) : 0,
                    withdrawal: yesterdayDoc ? (yesterdayDoc.redeem || 0) : 0,
                    rechargeCount: yesterdayDoc ? (yesterdayDoc.count || 0) : 0,
                    withdrawalCount: yesterdayDoc ? (yesterdayDoc.redeemCount || 0) : 0
                },
                total: {
                    recharge: totalRecharge,
                    withdrawal: totalWithdrawal
                }
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

        // Return more comprehensive info for "Advance" view
        const users = await User.find({}, {
            id: 1,
            phone: 1,
            balance: 1,
            date: 1,
            block: 1,
            username: 1,
            bank: 1,
            address: 1,
            upi: 1,
            upLine: 1,
            firstRecharge: 1,
            isAgent: 1
        }).sort({ date: -1 }).limit(200);

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

/** GET pending USDT (Upay) deposits – status created, for manual approve */
export const getUsdtDepositsPending = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }
        const list = await Transaction.find({ gateway: "Upay", status: "created" })
            .sort({ date: -1 })
            .limit(100)
            .lean();
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};

/** POST manually approve a USDT deposit by transaction id */
export const approveUsdtDeposit = async (req, res, next) => {
    try {
        const api = req.params.api;
        if (api !== process.env.AdminAPI) {
            return next(new ErrorResponse("Permission Denied", 401));
        }
        const { id: transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({ success: false, message: "Transaction id required" });
        }
        const doc = await Transaction.findOne({ id: transactionId, gateway: "Upay", status: "created" });
        if (!doc) {
            return res.status(404).json({ success: false, message: "Pending USDT deposit not found" });
        }
        const amount = doc.amount;
        const userId = doc.userId;
        const number = doc.number;

        await Transaction.updateOne(
            { id: transactionId, status: "created" },
            { status: "success", expired: true, $inc: { __v: 1 } }
        );

        const date = new Date();
        const localDate = (date / 1000 + 19800) * 1000;
        const now = new Date(localDate);
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const daySorted = day < 10 ? `0${day}` : `${day}`;
        const monthSorted = month < 10 ? `0${month}` : `${month}`;
        const newDate = `${daySorted}-${monthSorted}-${year}`;
        const todayProfit = `${day}/${month}/${year}`;
        const dayMonth = todayProfit;

        await Daily.updateOne(
            { id: newDate },
            { $inc: { count: +1, amount } },
            { upsert: true }
        );

        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(200).json({ success: true, message: "Transaction marked success; user not found" });
        }

        const usdtNote = "manual";

        if (!user.firstRecharge) {
            const bonusAmount = amount + (amount * 10) / 100;
            if (user.upLine && user.upLine[0]) {
                await User.updateOne(
                    { id: user.upLine[0] },
                    {
                        $inc: { balance: +100 },
                        $push: {
                            walletHistory: {
                                amount: 100,
                                date: Date.now(),
                                credit: true,
                                note: `Referal Reward User: ${user.id}`,
                            },
                        },
                    }
                );
                await offerBonus.updateOne(
                    { userId: user.upLine[0] },
                    {
                        userId: user.upLine[0],
                        $inc: { amount: +100, [`todayProfit.${todayProfit}.referral`]: +100, totalReferral: +100 },
                        $push: { history: { credit: "wallet", amount: 100, note: `Referal Reward User: ${user.id}`, date: Date.now() } },
                    },
                    { upsert: true }
                );
            }
            await User.updateOne(
                { id: user.id },
                {
                    firstRecharge: true,
                    $inc: { balance: +bonusAmount },
                    $push: {
                        rechargeHistory: { amount: bonusAmount, date: Date.now(), status: "Success", usdt: usdtNote },
                        walletHistory: { amount: bonusAmount, date: Date.now(), credit: true, note: `Add money ID: ${number} (manual)` },
                    },
                }
            );
        } else {
            let bonusAmount = amount;
            if (amount > 200) {
                bonusAmount = amount + (amount * 3) / 100;
            }
            await User.updateOne(
                { id: user.id },
                {
                    $inc: { balance: +bonusAmount },
                    $push: {
                        rechargeHistory: { amount: bonusAmount, date: Date.now(), status: "Success", usdt: usdtNote },
                        walletHistory: { amount: bonusAmount, date: Date.now(), credit: true, note: `Add money ID: ${number} (manual)` },
                    },
                }
            );
            const level0profit = (amount * 3) / 100;
            const level1profit = (amount * 0) / 100;
            const level2profit = (amount * 0) / 100;
            if (user.upLine && user.upLine[0]) {
                await User.updateOne({ id: user.upLine[0] }, { $inc: { balance: level0profit } });
                await offerBonus.updateOne(
                    { userId: user.upLine[0] },
                    {
                        userId: user.upLine[0],
                        $inc: { amount: level0profit, [`todayProfit.${todayProfit}.level0`]: level0profit, totalLevel0: level0profit },
                        $push: { history: { credit: "wallet", amount: level0profit, note: `Recharge bonus: ${user.id}`, date: Date.now() } },
                    },
                    { upsert: true }
                );
            }
            const userDate = new Date(user.date);
            const userDateLocal = (userDate / 1000 + 19800) * 1000;
            const newuserDate = new Date(userDateLocal);
            const userday = newuserDate.getDate();
            const usermonth = newuserDate.getMonth() + 1;
            const userdayMonth = `${userday}/${usermonth}/${year}`;
            if (dayMonth === userdayMonth && user.upLine) {
                for (let i = 0; i < 3; i++) {
                    if (user.upLine[i]) {
                        const field = `newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`;
                        await promotion.updateOne({ userId: user.upLine[i] }, { $inc: { [field]: amount } }, { upsert: true });
                    }
                }
                const updates = {};
                for (let i = 0; i < 7; i++) {
                    if (user.upLine[i]) {
                        updates[`level${i}.${user.phone}.totalRecharge`] = amount;
                        updates[`level${i}.${user.phone}.firstRecharge`] = 0;
                    }
                }
                if (Object.keys(updates).length) {
                    for (let i = 0; i < 7; i++) {
                        if (user.upLine[i]) {
                            await promotion.updateOne({ userId: user.upLine[i] }, { $inc: { [`level${i}.${user.phone}.totalRecharge`]: amount } }, { upsert: true });
                        }
                    }
                }
            }
        }

        res.status(200).json({ success: true, message: "USDT deposit approved and balance credited" });
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }
};
