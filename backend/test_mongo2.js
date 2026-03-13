import mongoose from "mongoose";

mongoose.connect("mongodb://vga2:BHf9f5bWaQR5DOCV@ac-fyocyor-shard-00-00.ajpp8tr.mongodb.net:27017,ac-fyocyor-shard-00-01.ajpp8tr.mongodb.net:27017,ac-fyocyor-shard-00-02.ajpp8tr.mongodb.net:27017/vga3?authSource=admin&replicaSet=atlas-14iych-shard-0&ssl=true")
  .then(async () => {
    console.log("Connected to MongoDB!");
    // Need to define a minimal schema to read User
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model("User", userSchema, "newUsers"); // FIXED COLLECTION NAME
    
    // Find a user with some recharge history
    const users = await User.find({ "rechargeHistory.0": { $exists: true } }).limit(1).lean();
    console.log("Found user with recharge history:", users.length ? users[0].id : "None found");
    if(users.length) {
      console.log(users[0].rechargeHistory);
    }
    process.exit(0);
  });
