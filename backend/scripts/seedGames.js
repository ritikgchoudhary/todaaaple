
import axios from 'axios';

const ADMIN_API_KEY = "0f58faf1-20ea-489b-ad86-948cbdc9b7a3";
const BASE_URL = "http://localhost:4001";

function buildBzvmLogo(icon) {
    if (!icon) return "";
    return `https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/${icon}`;
}

function buildBzvmChar(char) {
    if (!char) return "";
    return `https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/${char}`;
}

const GAMES = [
    // Sports
    {
        key: "9wickets",
        name: "9WICKETS",
        category: "sports",
        type: "featured",
        enabled: true,
        sortOrder: 0,
        logoUrl: buildBzvmLogo("4-GP9W.png"),
        charImageUrl: buildBzvmChar("4-GP9W.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
        onClickPath: "/cricket",
    },
    {
        key: "lucky-sports",
        name: "Lucky Sports",
        category: "sports",
        type: "grid",
        enabled: true,
        sortOrder: 1,
        logoUrl: buildBzvmLogo("4-GPLS.png"),
        charImageUrl: buildBzvmChar("4-GPLS.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
        onClickPath: "/cricket",
    },
    {
        key: "saba-sports",
        name: "SABA",
        category: "sports",
        type: "grid",
        enabled: true,
        sortOrder: 2,
        logoUrl: buildBzvmLogo("4-GPOW-en_US.png"),
        charImageUrl: buildBzvmChar("4-GPOW.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
        onClickPath: "/cricket",
    },
    {
        key: "newbb-sports",
        name: "NewBB",
        category: "sports",
        type: "grid",
        enabled: true,
        sortOrder: 3,
        logoUrl: buildBzvmLogo("4-GPBB-new bb.png"),
        charImageUrl: buildBzvmChar("4-GPNBB.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
        onClickPath: "/cricket",
    },

    // Live Casino
    {
        key: "evo",
        name: "EVO",
        category: "casino",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        logoUrl: buildBzvmLogo("3-GPEV.png"),
        charImageUrl: buildBzvmChar("3-1.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
        onClickPath: "/casino",
    },
    {
        key: "pt",
        name: "PT",
        category: "casino",
        type: "grid",
        enabled: true,
        sortOrder: 1,
        logoUrl: buildBzvmLogo("3-GPPT3.png"),
        charImageUrl: buildBzvmChar("3-2.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
        onClickPath: "/casino",
    },
    {
        key: "ezugi",
        name: "Ezugi",
        category: "casino",
        type: "grid",
        enabled: true,
        sortOrder: 2,
        logoUrl: buildBzvmLogo("3-GPEZ.png"),
        charImageUrl: buildBzvmChar("3-3.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
        onClickPath: "/casino",
    },
    {
        key: "sexy",
        name: "SEXY",
        category: "casino",
        type: "grid",
        enabled: true,
        sortOrder: 3,
        logoUrl: buildBzvmLogo("3-GPSX2.png"),
        charImageUrl: buildBzvmChar("3-4.png"),
        backgroundUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
        onClickPath: "/casino",
    },

    // Crash
    {
        key: "aviator",
        name: "Aviator",
        category: "crash",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        charImageUrl: "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png",
        onClickPath: "/aviator",
    },
    {
        key: "aviator-x",
        name: "AviatorX",
        category: "crash",
        type: "grid",
        enabled: true,
        sortOrder: 1,
        // reusing image for now
        charImageUrl: "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png",
        onClickPath: "/aviator",
    },

    // Slot
    {
        key: "slots-hot",
        name: "HOT Slots",
        category: "slot",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/2.png",
        onClickPath: "/casino",
    },

    // Cards
    {
        key: "cards-jili",
        name: "JILI Cards",
        category: "cards",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/6.png",
        onClickPath: "/casino",
        badge: "JL",
    },

    // Lottery
    {
        key: "india-lotto",
        name: "INDIA LOTTO",
        category: "lottery",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        badge: "National Jackpot",
        onClickPath: "/wingo",
    },
    {
        key: "sea-lottery",
        name: "SEA",
        category: "lottery",
        type: "grid",
        enabled: true,
        sortOrder: 1,
        badge: "TC GAMING",
        onClickPath: "/wingo",
    },

    // Cockfight
    {
        key: "sv388",
        name: "SV388",
        category: "cockfight",
        type: "grid",
        enabled: true,
        sortOrder: 0,
        badge: "SV",
        onClickPath: "/casino",
    },
];

async function seed() {
    console.log("Starting seed process...");
    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const game of GAMES) {
        try {
            await axios.post(`${BASE_URL}/gamesCatalogAdmin/${ADMIN_API_KEY}`, game);
            console.log(`✅ Created: ${game.name}`);
            success++;
        } catch (err) {
            if (err.response && err.response.status === 409) {
                console.log(`⏭️  Skipped (already exists): ${game.name}`);
                skipped++;
            } else {
                console.error(`❌ Failed: ${game.name}`, err.message);
                failed++;
            }
        }
    }

    console.log(`\nDone! Created: ${success}, Skipped: ${skipped}, Failed: ${failed}`);
}

seed();
