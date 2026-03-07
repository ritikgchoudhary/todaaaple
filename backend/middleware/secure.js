import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

const checkAuth = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findOne({id: id});
        if (!user) {
            console.log("checkAuth failed: user not found for id", id);
            return res.status(401).json({ message: 'Auth Failed' });
        }
        if (!req.headers.authorization) {
            console.log("checkAuth failed: missing authorization header");
            return res.status(401).json({ message: 'Auth Failed' });
        }
        const token = req.headers.authorization.split(" ")[1];
        
        if(token !== user.token) {
            console.log("checkAuth failed: token mismatch for user", id);
            return res.status(401).json({ message: 'Auth Failed' });
        }
        
        const decoded = jwt.verify(token, 'hjbfhv12hbb3hb434343');
        next();
    } catch (error) {
        console.log("checkAuth exception:", error.message);
        res.status(401).json({ message: 'Auth Failed' });
    }
};
export default checkAuth;
