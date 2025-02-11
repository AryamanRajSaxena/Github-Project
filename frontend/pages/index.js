// frontend/pages/index.js
import { useState } from "react";
import axios from "axios";
import md5 from "md5"; // Used for hashing the password before sending it to the server

export default function Home() {
    // State variables to store user input and server responses
    const [userID, setUserID] = useState(""); // Stores the user ID input
    const [password, setPassword] = useState(""); // Stores the password input
    const [data, setData] = useState(null); // Stores user data after authentication
    const [error, setError] = useState(""); // Stores error messages if authentication fails

    // Function to handle login and authentication
    const handleLogin = async () => {
        setError(""); // Reset error message before new login attempt
        try {
            // Send a request to authenticate the user
            const response = await axios.post("https://backend-roan-chi-19.vercel.app/", {
                userID,
                password: md5(password), // Hash the password before sending it to the API
            });
            console.log("Logging in with:", { userID, password: md5(password) });

            // Store the received JWT token in localStorage for future API requests
            localStorage.setItem("token", response.data.token);
            
            // Fetch user data after successful authentication
            fetchData(response.data.token);
        } catch (err) {
            setError("Invalid credentials"); // Show an error message if login fails
        }
    };

    // Function to fetch user data from the server after authentication
const fetchData = async (token) => {
    try {
        const response = await axios.get("http://localhost:3001/api/users", {  // ← Ensure the full URL
            headers: { Authorization: `Bearer ${token}` }, 
        });

        setData(response.data); // Store the received user data
    } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message); // Debugging output
        setError("Failed to fetch data"); 
    }
};


    return (
        <div>
            <h1>Login</h1>
            {/* Input field for user ID */}
            <input type="text" placeholder="User ID" value={userID} onChange={(e) => setUserID(e.target.value)} />
            
            {/* Input field for password */}
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            {/* Button to trigger login */}
            <button onClick={handleLogin}>Login</button>
            
            {/* Display error message if login fails */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            {/* Display user data if authentication is successful */}
            {data && (
                <div>
                    <h2>Users Data</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre> {/* Pretty print the user data */}
                </div>
            )}
        </div>
    );
}
