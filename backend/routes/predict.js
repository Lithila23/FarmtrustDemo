const express = require("express");
const axios = require("axios");

const router = express.Router();

// Retrieve the AI service URL from environment variables, defaulting to localhost for development
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

router.get("/:product", async (req, res) => {
    try {
        const { product } = req.params;

        // Use encodeURIComponent to safely handle product names with spaces or special characters
        const response = await axios.get(
            `${AI_SERVICE_URL}/predict/${encodeURIComponent(product)}`
        );

        res.json(response.data);

    } catch (error) {
        // Log the exact error to the console for easier debugging
        console.error(`[Predict Route] Error fetching prediction for product "${req.params.product}":`, error.message);

        // Forward the correct HTTP status code if the AI service responds with an error (e.g., 404 or 400)
        const statusCode = error.response ? error.response.status : 500;

        res.status(statusCode).json({
            error: "Prediction failed",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

module.exports = router;
