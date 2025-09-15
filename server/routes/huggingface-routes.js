const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/tryon", async (req, res) => {
  const { personImage, garmentImage, seed } = req.body;

  try {
    const response = await axios.post(
      `${process.env.TRYON_URL}/Submit`, // Your Hugging Face endpoint
      {
        clothImage: garmentImage,
        humanImage: personImage,
        seed: seed || 42,
      },
      {
        headers: {
          "Content-Type": "application/json",
          token: process.env.HF_TOKEN, // from .env
        },
        timeout: 60000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("HF Try-On API error:", error.message);
    res.status(500).json({ error: "Failed to process try-on" });
  }
});

module.exports = router;
