import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

const checkAuth = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findOne({id: id});
        const token = req.headers.authorization.split(" ")[1];
        
        if(token !== user.token)
        return res.status(401).json({
            message: 'Auth Failed'
        });
        
        const decoded = jwt.verify(token, 'hjbfhv12hbb3hb434343');
        
        
        next();
        
 
    } catch (error) {
        
        res.status(401).json({
            message: 'Auth Failed'
        });
    }
};
export default checkAuth;
