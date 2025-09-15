require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");

// Routers
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

// Models
const User = require("./models/User");

// Debug Mongo URI
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("Type:", typeof process.env.MONGO_URI);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI.trim(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Default Admin Setup
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123"; // ⚠️ change before production

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        userName: "admin",
        email: adminEmail,
        password: hashPassword,
        role: "admin",
      });
      console.log("👤 Default admin user created:", adminEmail);
    }
  })
  .catch((error) => console.log("❌ MongoDB connection error:", error));

// Express App
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Setup
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ===== Routes =====
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/common/feature", commonFeatureRouter);

// ===== Hugging Face Proxy Route =====
// Example: Try-On API
app.post("/api/ai/tryon", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/YOUR_MODEL_ID", // Replace with your Hugging Face Space/Model
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`, // from .env
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: "HuggingFace request failed", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error calling HuggingFace API:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Root Check
app.get("/", (req, res) => {
  res.send("✅ Backend API is running");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server is now running on port ${PORT}`));
