import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import https from "https";
import path from "path";
import Trans from "../model/transaction.js";
import User from "../model/userSchema.js";
import daily from "../model/daily.js";
import offerBonus from "../model/offerBonus.js";
import promotion from "../model/promotion.js";
import { creditCommission } from "./commission.js";

/** Strip whitespace / quotes / BOM / invisible chars from .env (common cause of invalid MD5). */
function cleanSecret(val) {
  if (val == null) return "";
  let s = String(val)
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r/g, "")
    .trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Payin key from UZPAY_PAYIN_KEY, or one-line file UZPAY_PAYIN_KEY_FILE (avoids hidden .env chars). */
function loadUzPayPayinKey() {
  const filePathRaw = cleanSecret(process.env.UZPAY_PAYIN_KEY_FILE);
  if (filePathRaw) {
    try {
      const abs = path.isAbsolute(filePathRaw)
        ? filePathRaw
        : path.join(process.cwd(), filePathRaw);
      if (fs.existsSync(abs)) {
        return cleanSecret(fs.readFileSync(abs, "utf8"));
      }
      console.error("UzPay: UZPAY_PAYIN_KEY_FILE not found:", abs);
    } catch (e) {
      console.error("UzPay: UZPAY_PAYIN_KEY_FILE read error:", e.message);
    }
  }
  return cleanSecret(process.env.UZPAY_PAYIN_KEY);
}

/**
 * UzPay payin (/pay/web) — official sign (per UzPay support):
 *   md5(merchant_id + amount + payin_key)
 * Amount must be two decimals (e.g. 500.00). No spaces. Order: merchant_id, then amount, then key.
 * POST still includes order_id, pay_type, notify_url, etc.; they are not part of this sign string.
 * Optional: UZPAY_PAYIN_SIGN_UPPERCASE=1 for uppercase hex.
 */
function uzPayPayinMd5(paramsForSign, payinKeyRaw) {
  const payinKey = cleanSecret(payinKeyRaw);
  const merchant_id = String(paramsForSign.merchant_id ?? "");
  const amount = String(paramsForSign.amount ?? "");
  const signInput = merchant_id + amount + payinKey;
  const hex = crypto.createHash("md5").update(signInput, "utf8").digest("hex");
  return process.env.UZPAY_PAYIN_SIGN_UPPERCASE === "1"
    ? hex.toUpperCase()
    : hex.toLowerCase();
}

export const uzPayCreateOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const rawMobile = req.body.customer_mobile ?? req.user?.phone;
    const customer_mobile =
      rawMobile != null && String(rawMobile).trim() !== ""
        ? String(rawMobile).trim()
        : null;
    const customer_name = req.body.customer_name || req.user?.username || "User";
    const customer_email = req.body.customer_email || req.user?.email || "";
    const amount = req.body.amount;

    if (!amount || !userId || !customer_mobile) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields: amount, userId, customer_mobile",
      });
    }

    const user = await User.findOne({ id: parseInt(userId) });
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
    if (user.block) {
      return res.status(400).json({ code: 400, message: "Account suspended" });
    }

    if (user.demo) {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;
      await Trans.create({
        id: `DEMO_UZ_${Date.now()}`,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amount),
        status: "success",
        gateway: "UzPay",
        name: customer_name || "Demo User",
        email: customer_email || "demo@example.com",
        phone: customer_mobile,
      });
      await User.updateOne(
        { id: parseInt(userId) },
        { $inc: { balance: parseFloat(amount) } }
      );
      return res.status(200).json({
        code: 200,
        message: "Demo payment successful",
        redirect_url: `${process.env.CLIENT_URL}/#/wallet/RechargeHistory`,
      });
    }

    const MERCHANT_ID = cleanSecret(process.env.UZPAY_MERCHANT_ID);
    const PAYIN_KEY = loadUzPayPayinKey();
    const API_URL = process.env.UZPAY_API_URL || "https://pay.uzpay.xyz/pay/web";
    const payType = String(process.env.UZPAY_PAY_TYPE || "104").trim();

    if (!MERCHANT_ID || !PAYIN_KEY) {
      return res.status(500).json({
        code: 500,
        message:
          "UzPay is not configured. Set UZPAY_MERCHANT_ID and UZPAY_PAYIN_KEY in config.env",
      });
    }

    const amountStr = parseFloat(amount).toFixed(2);
    const order_id = `UZ${Date.now()}${Math.floor(Math.random() * 900000 + 100000)}`.slice(0, 64);
    const serverBase = cleanSecret(process.env.SERVER_URL).replace(/\/+$/, "");
    if (!serverBase) {
      return res.status(500).json({
        code: 500,
        message: "SERVER_URL is missing in config; UzPay notify_url cannot be built",
      });
    }
    const notify_url = `${serverBase}/uzPayCallback`;

    const paramsForSign = {
      merchant_id: MERCHANT_ID,
      amount: amountStr,
      order_id,
      pay_type: payType,
      notify_url,
    };

    const returnUrlRaw = cleanSecret(process.env.UZPAY_RETURN_URL);
    if (returnUrlRaw) {
      paramsForSign.return_url = returnUrlRaw;
    }

    const sign = uzPayPayinMd5(paramsForSign, PAYIN_KEY);
    const params = { ...paramsForSign, sign };

    if (process.env.UZPAY_DEBUG_SIGN === "1") {
      console.log(
        "UzPay payin sign input (no secret): md5( merchant_id + amount + payin_key ) = md5(",
        JSON.stringify(MERCHANT_ID) + " + " + JSON.stringify(amountStr) + " + <UZPAY_PAYIN_KEY> )"
      );
      console.log("UzPay PAYIN_KEY length:", PAYIN_KEY.length, "chars");
    }

    const uzPayAxios = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
      timeout: 30000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const formData = new URLSearchParams(params).toString();
    const response = await uzPayAxios.post(API_URL, formData);
    let result = response.data;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        result = { status: "error", message: result.slice(0, 300) };
      }
    }

    console.log("UzPay Response:", result);

    if (result && result.status === "success" && result.payment_url) {
      const lastTrans = await Trans.findOne().sort({ number: -1 });
      const newIncrement = lastTrans ? lastTrans.number + 1 : 1;

      await Trans.create({
        id: order_id,
        number: newIncrement,
        date: Date.now(),
        userId: parseInt(userId),
        amount: parseFloat(amountStr),
        status: "created",
        gateway: "UzPay",
        gatewayOrderId: order_id,
        name: customer_name || "Customer",
        email: customer_email || "",
        phone: customer_mobile,
        paymentUrl: result.payment_url,
      });

      return res.status(200).json({
        code: 200,
        message: "Payment URL generated successfully",
        payment_url: result.payment_url,
        order_id,
      });
    }

    const rawMsg = result?.message || result?.msg || "UzPay order creation failed";
    const isSig =
      typeof rawMsg === "string" && rawMsg.toLowerCase().includes("signature");
    const hint = isSig
      ? "UzPay Payin secret mismatch: update UZPAY_PAYIN_KEY (Collection key, not Payout) in config.env or use UZPAY_PAYIN_KEY_FILE, then pm2 restart rushpay --update-env. Contact UzPay for /pay/web sign docs if needed."
      : undefined;
    if (isSig) {
      console.error(
        "UzPay Invalid signature — merchant_id OK; verify Payin key. UZPAY_DEBUG_SIGN=1 logs sign base (no secret)."
      );
    }
    return res.status(400).json({
      code: 400,
      message: rawMsg,
      ...(hint ? { hint } : {}),
      data: result,
    });
  } catch (error) {
    console.error("UzPay Create Order Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/** Amount string for UzPay MD5 (must match two-decimal rule). */
function uzPayAmountTwoDecimals(v) {
  const n = parseFloat(String(v ?? ""));
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}

/**
 * Verify notify sign: UzPay may use same rule as pay-in md5(merchant_id + amount + key),
 * or legacy md5(order_id + amount + key). Accept if either matches (amount normalized to xx.xx).
 */
function uzPayCallbackSignOk(body, order_id, amountRaw, signReceived, payinKey) {
  const amountStr = uzPayAmountTwoDecimals(amountRaw);
  if (!amountStr || !payinKey) return false;
  const sig = String(signReceived ?? "").trim().toLowerCase();
  if (!sig) return false;

  const hashes = new Set();
  const mid =
    body.merchant_id != null && String(body.merchant_id).trim() !== ""
      ? String(body.merchant_id).trim()
      : body.merchantId != null && String(body.merchantId).trim() !== ""
        ? String(body.merchantId).trim()
        : "";
  if (mid) {
    hashes.add(
      crypto.createHash("md5").update(mid + amountStr + payinKey, "utf8").digest("hex").toLowerCase()
    );
  }
  hashes.add(
    crypto
      .createHash("md5")
      .update(String(order_id) + amountStr + payinKey, "utf8")
      .digest("hex")
      .toLowerCase()
  );

  for (const h of hashes) {
    if (h === sig) return true;
  }
  return false;
}

export const uzPayCallback = async (req, res) => {
  const okText = process.env.UZPAY_CALLBACK_OK_TEXT || "success";
  const failText = process.env.UZPAY_CALLBACK_FAIL_TEXT || "fail";

  try {
    const body = req.body || {};
    const order_id =
      body.order_id ?? body.orderId ?? body.out_trade_no ?? body.outTradeNo;
    const amount = body.amount ?? body.money ?? body.total_amount ?? body.totalAmount;
    const status = body.status ?? body.trade_status ?? body.tradeStatus;
    const sign = body.sign ?? body.Sign;

    console.log("UzPay Callback received:", body);

    if (
      order_id === undefined ||
      order_id === null ||
      String(order_id).trim() === "" ||
      amount === undefined ||
      amount === null ||
      status === undefined ||
      status === null ||
      String(status).trim() === ""
    ) {
      console.error("UzPay callback missing fields");
      return res.status(400).send(failText);
    }

    const PAYIN_KEY = loadUzPayPayinKey();
    if (!uzPayCallbackSignOk(body, String(order_id).trim(), amount, sign, PAYIN_KEY)) {
      console.error("UzPay callback signature mismatch", {
        order_id,
        amount,
        triedAmount2: uzPayAmountTwoDecimals(amount),
      });
      return res.status(400).send(failText);
    }

    const statusStr = String(status).toLowerCase();
    const paid =
      statusStr === "success" ||
      statusStr === "paid" ||
      statusStr === "1" ||
      status === 1;

    if (!paid) {
      return res.status(200).send(okText);
    }

    const transaction = await Trans.findOne({ id: order_id });
    if (!transaction) {
      console.error("UzPay transaction not found:", order_id);
      return res.status(200).send(okText);
    }

    if (transaction.status === "success") {
      return res.status(200).send(okText);
    }

    const paidAmt = parseFloat(String(amount));
    const expected = parseFloat(transaction.amount);
    if (Number.isFinite(paidAmt) && Number.isFinite(expected) && Math.abs(paidAmt - expected) > 0.02) {
      console.error("UzPay amount mismatch", paidAmt, expected);
      return res.status(400).send(failText);
    }

    const user = await User.findOne({ id: transaction.userId });
    if (!user) {
      console.error("UzPay user not found for transaction:", order_id);
      return res.status(200).send(okText);
    }

    const paymentAmount = parseFloat(transaction.amount);

    await Trans.updateOne(
      { id: order_id },
      { status: "success", completedAt: Date.now() }
    );

    await creditCommission("PACKAGE_PURCHASE", transaction.userId, paymentAmount, order_id);
    await creditCommission("KYC_PAYMENT", transaction.userId, paymentAmount, order_id);

    const date = new Date();
    const localDate = (date / 1000 + 19800) * 1000;
    const newDatefor = new Date(localDate);
    const day = newDatefor.getDate();
    const month = newDatefor.getMonth() + 1;
    const year = newDatefor.getFullYear();

    var daySorted = day < 10 ? `0${day}` : `${day}`;
    var monthSorted = month < 10 ? `0${month}` : `${month}`;
    const newDate = `${daySorted}-${monthSorted}-${year}`;
    const todayProfit = `${day}/${month}/${year}`;

    await daily.updateOne(
      { id: newDate },
      { $inc: { count: +1, amount: paymentAmount } },
      { upsert: true }
    );

    var bonusAmount = paymentAmount;

    const rechargeCount = await Trans.countDocuments({
      userId: transaction.userId,
      status: "success",
      gateway: {
        $in: ["lgPay", "WatchPay", "RupeeRush", "UzPay", "Cashfree", "PhonePe", "Razorpay"],
      },
    });

    if (!user.firstRecharge || rechargeCount === 1) {
      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        const referralBonus = Math.round(paymentAmount * 0.1 * 100) / 100;

        await User.updateOne(
          { id: user.upLine[0] },
          {
            $inc: { balance: referralBonus },
            $push: {
              walletHistory: {
                amount: referralBonus,
                date: Date.now(),
                credit: true,
                note: `Referral Reward User: ${user.id}`,
              },
            },
          }
        );

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: referralBonus,
              [`todayProfit.${todayProfit}.referral`]: referralBonus,
              totalReferral: referralBonus,
            },
            $push: {
              history: {
                credit: "wallet",
                amount: referralBonus,
                note: `Referral Reward User: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );
      }

      await User.updateOne(
        { id: transaction.userId },
        {
          firstRecharge: true,
          $inc: { balance: bonusAmount },
          $push: {
            rechargeHistory: {
              amount: bonusAmount,
              date: Date.now(),
              status: "Success",
            },
            walletHistory: {
              amount: bonusAmount,
              date: Date.now(),
              credit: true,
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );

      const level0profit = (paymentAmount * 3) / 100;

      if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
        await User.updateOne({ id: user.upLine[0] }, { $inc: { balance: level0profit } });

        await offerBonus.updateOne(
          { userId: user.upLine[0] },
          {
            userId: user.upLine[0],
            $inc: {
              amount: level0profit,
              [`todayProfit.${todayProfit}.level0`]: level0profit,
              totalLevel0: level0profit,
            },
            $push: {
              history: {
                credit: "wallet",
                amount: level0profit,
                note: `Recharge bonus: ${user.id}`,
                date: Date.now(),
              },
            },
          },
          { upsert: true }
        );
      }
    } else {
      if (paymentAmount > 200) {
        const level0profit = (paymentAmount * 3) / 100;
        bonusAmount = paymentAmount + level0profit;

        if (user.upLine && user.upLine[0] && user.upLine[0] !== "null") {
          await User.updateOne({ id: user.upLine[0] }, { $inc: { balance: level0profit } });

          await offerBonus.updateOne(
            { userId: user.upLine[0] },
            {
              userId: user.upLine[0],
              $inc: {
                amount: level0profit,
                [`todayProfit.${todayProfit}.level0`]: level0profit,
                totalLevel0: level0profit,
              },
              $push: {
                history: {
                  credit: "wallet",
                  amount: level0profit,
                  note: `Recharge bonus: ${user.id}`,
                  date: Date.now(),
                },
              },
            },
            { upsert: true }
          );
        }
      }

      await User.updateOne(
        { id: transaction.userId },
        {
          $inc: { balance: bonusAmount },
          $push: {
            rechargeHistory: {
              amount: bonusAmount,
              date: Date.now(),
              status: "Success",
            },
            walletHistory: {
              amount: bonusAmount,
              date: Date.now(),
              credit: true,
              note: `Add money ID: ${transaction.number}`,
            },
          },
        }
      );
    }

    const userDate = new Date(user.date);
    const userDateLocal = (userDate / 1000 + 19800) * 1000;
    const newuserDate = new Date(userDateLocal);
    const dayMonth = `${day}/${month}/${year}`;
    const userday = newuserDate.getDate();
    const usermonth = newuserDate.getMonth() + 1;
    const userYear = newuserDate.getFullYear();
    const userdayMonth = `${userday}/${usermonth}/${userYear}`;

    if (dayMonth === userdayMonth && user.upLine) {
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`newlevel${i}.${dayMonth}.${user.phone}.todayRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    } else if (user.upLine) {
      for (let i = 0; i < 7; i++) {
        if (user.upLine[i] && user.upLine[i] !== "null") {
          await promotion.updateOne(
            { userId: user.upLine[i] },
            {
              userId: user.upLine[i],
              $inc: {
                [`level${i}.${user.phone}.totalRecharge`]: paymentAmount,
              },
            },
            { upsert: true }
          );
        }
      }
    }

    console.log("UzPay payment processed successfully:", order_id);
    return res.status(200).send(okText);
  } catch (error) {
    console.error("UzPay Callback Error:", error);
    return res.status(500).send(failText);
  }
};

export const uzPayBalanceFetch = async (req, res) => {
  try {
    const api = req.params.api;
    if (api !== process.env.AdminAPI) {
      return res.status(403).json({ status: "error", message: "Unauthorized access" });
    }

    const MERCHANT_ID = cleanSecret(process.env.UZPAY_MERCHANT_ID);
    const PAYOUT_KEY = cleanSecret(process.env.UZPAY_PAYOUT_KEY);
    const BALANCE_URL =
      process.env.UZPAY_BALANCE_URL || "https://pay.uzpay.xyz/pay/balance";

    if (!MERCHANT_ID || !PAYOUT_KEY) {
      return res.status(400).json({
        status: "error",
        message: "UZPAY_MERCHANT_ID and UZPAY_PAYOUT_KEY must be set",
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const sign = crypto
      .createHash("md5")
      .update(String(MERCHANT_ID) + String(timestamp) + PAYOUT_KEY)
      .digest("hex")
      .toLowerCase();

    const postData = JSON.stringify({
      merchant_id: String(MERCHANT_ID),
      timestamp,
      sign,
    });

    const uzAxios = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    const response = await uzAxios.post(BALANCE_URL, postData);
    const result = response.data;

    console.log("UzPay Balance Response:", result);

    if (result && result.status === "success" && result.data) {
      return res.status(200).json({
        status: "success",
        message: "Balance fetched successfully",
        data: result.data,
      });
    }

    return res.status(400).json({
      status: "error",
      message: result?.message || "Failed to fetch UzPay balance",
      data: result,
    });
  } catch (error) {
    console.error("UzPay Balance Fetch Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.response?.data || error.message,
    });
  }
};
