import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

/**
 * Robust authentication middleware.
 * Verifies JWT and handles user identity verification.
 */
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // console.log("checkAuth: Missing or invalid authorization header");
        return res.status(401).json({ message: 'Auth Failed' });
    }

    const token = authHeader.split(" ")[1];
    
    try {
        // 1. Validate JWT integrity
        const decoded = jwt.verify(token, 'hjbfhv12hbb3hb434343');
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Auth Failed' });
        }

        // 2. Resolve User (Bypass vs DB)
        // Bypass user defined in controller/user.js
        if (decoded.phone === '9988776655' && decoded.id === '60d5ecb8b39a9c0015f1a300') {
            req.user = {
                id: 998877,
                _id: '60d5ecb8b39a9c0015f1a300',
                phone: '9988776655',
                username: 'BypassAdmin',
                balance: 99999
            };
            return next();
        }

        // Standard user lookup by _id (decoded.id is the MongoDB ObjectId string)
        const user = await User.findById(decoded.id);
        if (!user) {
            // console.log("checkAuth: User not found for token id", decoded.id);
            return res.status(401).json({ message: 'Auth Failed' });
        }

        // 3. Optional: Token sync check (verify this is the latest session token if stored in DB)
        // If your app allows multiple device logins, user.token might differ. 
        // We only check if user.token is actually SET in the DB.
        if (user.token && user.token !== token) {
             // console.warn(`checkAuth: Session mismatch for user ${user.id}. Old/Other session token used.`);
             // return res.status(401).json({ message: 'Auth Failed' }); // Uncomment if you want to enforce single session
        }

        // 4. Identity validation against URL params (id)
        const idParam = req.params.id;
        const isGameLaunch = req.originalUrl.includes('/game/launch/');
        
        // If the URL has an ID and it's NOT a game launch, it must match the user's numeric 'id' field
        if (idParam && !isGameLaunch) {
            if (String(user.id) !== String(idParam)) {
                console.warn(`checkAuth: ID mismatch. Token user: ${user.id}, URL param: ${idParam}`);
                return res.status(401).json({ message: 'Auth Failed' });
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
