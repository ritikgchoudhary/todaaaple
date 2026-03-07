import crypto from "crypto";
import axios from "axios";
import User from "../model/userSchema.js";
import Game from "../model/Game.js";
import ErrorResponse from "../utils/error.js";
import Dotenv from "dotenv";
Dotenv.config({ path: "./config.env" });

const TOKEN = process.env.SOFTAPI_TOKEN || "d94a7c3de0426e03bdce4ebee34da50d";
const SECRET = process.env.SOFTAPI_SECRET || "12345678901234567890123456789012"; // 32 chars
const SERVER_URL = "https://igamingapis.live/api/v1";

// Helper for AES-256-ECB encryption (matching PHP openssl_encrypt)
function encryptPayload(data, key) {
    if (key.length !== 32) throw new Error("Key must be 32 bytes long");
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(json, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export const launchGame = async (req, res, next) => {
    // 1. Identify User (Priority: Auth User > Param > Body)
    const userId = req.user?.id || req.params.id || req.body.userId;
    
    // 2. Identify Game (Priority: Body UID > Body ID > Param if it's NOT the User ID)
    const { game_uid, game_id } = req.body || {};
    
    if (!userId) {
        return next(new ErrorResponse("Missing user context (log in required)", 401));
    }
    const hasGameId = game_id != null && game_id !== "" && Number.isFinite(Number(game_id));
    const hasGameUid = game_uid != null && game_uid !== "";

    try {
        const user = await User.findOne({ id: userId });
        if (!user) return next(new ErrorResponse("User not found (ID: " + userId + ")", 404));

    // Prefer numeric game_id if sent; else look up by game_code (game_uid)
    let finalGameUid;
    if (hasGameId) {
        finalGameUid = Number(game_id);
    } else if (hasGameUid) {
        const gameItem = await Game.findOne({ game_code: game_uid });
        finalGameUid = gameItem ? gameItem.id : game_uid;
    } else if (req.params.id && req.params.id != userId) {
        // Fallback: If URL has numeric ID but it's not the authenticated user's ID, it must be the Game ID
        finalGameUid = req.params.id;
    } else {
        return next(new ErrorResponse("Game ID or Code missing from request", 400));
    }

        console.log(`Launching Game: userId=${userId}, game_uid=${game_uid}, game_id=${game_id} -> finalGameUid=${finalGameUid}`);

        const payload = {
            user_id: user.id,
            balance: user.balance,
            game_uid: finalGameUid, // Send the ID
            token: TOKEN,
            timestamp: Date.now(),
            return: process.env.CLIENT_URL || "https://toddapple.live",
            callback: `${process.env.SERVER_URL}/api/gameCallback`
        };

        console.log("Full Launch Payload:", JSON.stringify(payload, null, 2));

        const encrypted = encryptPayload(payload, SECRET);
        const url = `${SERVER_URL}?payload=${encodeURIComponent(encrypted)}&token=${encodeURIComponent(TOKEN)}`;

        const response = await axios.get(url);

        console.log("Full API Response:", JSON.stringify(response.data, null, 2));

        // DEBUG MODE: Return response to frontend but do NOT launch (success: false)
        /*
        res.status(200).json({
            success: false,
            msg: "DEBUG MODE: Check Network Tab for payload & response",
            api_response: response.data,
            payload_sent: payload // Send back what we sent too
        });
        */

        if (response.data.code === 0) {
            res.status(200).json({
                success: true,
                url: response.data.data.url
            });
        } else {
            res.status(400).json({
                success: false,
                msg: response.data.msg
            });
        }
    } catch (error) {
        console.error("Launch Game Error:", error.message);
        next(new ErrorResponse(error.message, 500));
    }
};

export const gameCallback = async (req, res) => {
    const data = req.body;
    console.log("Game Callback Received:", data);

    if (!data) {
        return res.status(200).json({
            credit_amount: -1,
            error: 'Invalid JSON'
        });
    }

    const { game_uid, member_account, bet_amount, win_amount } = data;

    try {
        const user = await User.findOne({ id: member_account });
        if (!user) {
            return res.status(200).json({
                credit_amount: -1,
                error: 'User not found'
            });
        }

        // Logic: new_balance = current_balance - bet_amount + win_amount
        const bet = parseFloat(bet_amount || 0);
        const win = parseFloat(win_amount || 0);
        const netChange = win - bet;

        const updatedUser = await User.findOneAndUpdate(
            { id: member_account },
            { $inc: { balance: netChange } },
            { new: true }
        );

        res.status(200).json({
            credit_amount: updatedUser.balance,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error("Callback Error:", error.message);
        res.status(200).json({
            credit_amount: -1,
            error: error.message
        });
    }
};
