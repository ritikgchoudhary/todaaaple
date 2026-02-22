import Brand from "../model/Brand.js";
import Game from "../model/Game.js";

// --- PROVIDERS (BRANDS) ---

export const getAllProviders = async (req, res) => {
    try {
        const providers = await Brand.find().sort({ brand_id: 1 });
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await Brand.findOneAndUpdate(
            { brand_id: id },
            { status: status },
            { new: true }
        );

        if (!updated) {
            const retry = await Brand.findByIdAndUpdate(id, { status }, { new: true });
            if (!retry) return res.status(404).json({ message: "Provider not found" });
            return res.status(200).json(retry);
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- GAMES ---

export const getAllGames = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", provider_id, category, service_code } = req.query;

        const query = {};
        if (search) {
            query.game_name = { $regex: search, $options: "i" };
        }
        if (provider_id) {
            query.brand_id = provider_id;
        }
        if (category !== undefined) {
            query.category = category;
        }

        const games = await Game.find(query)
            .sort({ id: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Game.countDocuments(query);

        res.status(200).json({
            games,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalGames: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGameStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await Game.findOneAndUpdate(
            { id: id },
            { status: status },
            { new: true }
        );

        if (!updated) {
            const retry = await Game.findByIdAndUpdate(id, { status }, { new: true });
            if (!retry) return res.status(404).json({ message: "Game not found" });
            return res.status(200).json(retry);
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGameInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, game_img, game_name } = req.body;

        let updateFields = {};
        if (category !== undefined) updateFields.category = category;
        if (game_img !== undefined) updateFields.game_img = game_img;
        if (game_name !== undefined) updateFields.game_name = game_name;

        // If no fields to update, return early with current object or message
        if (Object.keys(updateFields).length === 0) return res.status(200).json({ message: "Nothing to update" });

        // Try updating by custom 'id'
        let updated = await Game.findOneAndUpdate(
            { id: id },
            { $set: updateFields },
            { new: true }
        );

        // Fallback: try updating by '_id' if 'id' fails
        if (!updated) {
            updated = await Game.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
        }

        if (!updated) return res.status(404).json({ message: "Game not found" });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkUpdateGameCategory = async (req, res) => {
    try {
        const { gameIds, category } = req.body;

        if (!Array.isArray(gameIds) || gameIds.length === 0) {
            return res.status(400).json({ message: "No game IDs provided" });
        }

        const result = await Game.updateMany(
            { id: { $in: gameIds } },
            { $set: { category: category } }
        );

        res.status(200).json({
            success: true,
            message: "Games updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
