import mongoose from 'mongoose';

async function run() {
    const uri = "mongodb+srv://vga:VGAcsd%40123@cluster0.ajpp8tr.mongodb.net/vga3?appName=Cluster0&authSource=admin";
    console.log("Connecting to:", uri.replace(/:([^@]+)@/, ":****@"));

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ SUCCESS: Connected to MongoDB!");
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("✅ PING SUCCESSFUL!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ FAILED:", err.message);
        if (err.reason) console.log("Reason:", err.reason);
    }
}

run();
