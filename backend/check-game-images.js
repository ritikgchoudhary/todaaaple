import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        console.log("Checking Game Images...");
        // Check games visible in screenshot
        const games = await mongoose.connection.collection('games').find({
            game_name: { $in: ["BtiGaming", "SABA Sports", "LuckSportGaming"] }
        }).toArray();

        games.forEach(g => {
            console.log(`Game: ${g.game_name}`);
            console.log(`  game_img: ${g.game_img}`);
            console.log(`  game_img_cdn: ${g.game_img_cdn}`);
        });

        if (games.length === 0) console.log("No matching games found.");
    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
