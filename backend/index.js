// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import md5 from "md5";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware to parse JSON request bodies
app.use(express.json());
// Enable CORS for cross-origin requests
app.use(cors());

// Authentication Route
app.post("/api/authenticate", async (req, res) => {
    const { userID, password } = req.body;

    console.log("Received login request:", { userID, password });

    // Query Supabase
    const { data, error } = await supabase
        .from("users")
        .select("userid, role")
        .ilike("userid", userID.trim())
        .eq("password_hash", password.trim())
        .maybeSingle();

    console.log("Supabase Query Result:", { data, error });
    console.log("DEBUG: userid:", `"${userID}"`, "password:", `"${password}"`);

    if (error || !data) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token if user found
    const token = jwt.sign({ userID: data.userid, role: data.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});



// Get User Data Route (Protected Route)
app.get("/api/users", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Extract and verify JWT token from the Authorization header
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Build query to fetch user data
        let query = supabase.from("users").select("userid, role");
        // If user is not an admin, restrict results to only their own data
        if (decoded.role !== "admin") {
            query = query.eq("userid", decoded.userID);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        res.json(data);
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
