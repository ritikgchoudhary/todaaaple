import mongoose from 'mongoose';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import { RATE_LIMITS } from './consts.js';

const rateLimit = (config = RATE_LIMITS.api) => async (req, res, next) => {
    const { headers } = req;
    const ip = headers['CF-Connecting-IP'] || req.ip;
    
    // CF-Connecting-IP is to get the client ip from cloudflare            
    const opts = {
        storeClient: mongoose.connection,
        points: config.max, // Number of points
        duration: config.windowMs / 1000, // Per second(s)
    };

    try {
        const rateLimiterMongo = new RateLimiterMongo(opts);
        const rateLimiterRes = await rateLimiterMongo.consume(`${config.name}:${ip}`, 1);
        res.set({ 'X-RateLimit-Remaining': rateLimiterRes.remainingPoints });
        return next();
    } catch (rateLimiterRes) {
        res.set({ 'X-RateLimit-Remaining': rateLimiterRes.remainingPoints });
        return res.status(429).send({
            message: config.message,
            code: 429,
        });
    }
};

export default rateLimit;
