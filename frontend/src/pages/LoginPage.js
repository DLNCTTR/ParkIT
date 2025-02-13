import React, { useState } from "react";

const LoginPage = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(null); // ✅ Track success/failure

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 handleSubmit triggered!");

        setLoading(true);
        setMessage("");
        setIsSuccess(null);

        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
        console.log("🔹 API Base URL:", API_BASE_URL);

        if (!API_BASE_URL) {
            console.error("❌ API base URL is not set.");
            setMessage("Internal error: API URL not configured.");
            setIsSuccess(false);
            setLoading(false);
            return;
        }

        const endpoint = isSignIn
            ? `${API_BASE_URL}/api/auth/login`
            : `${API_BASE_URL}/api/auth/register`;

        console.log("🔹 Request Endpoint:", endpoint);

        const payload = isSignIn
            ? { username: formData.username, password: formData.password }
            : { username: formData.username, email: formData.email, password: formData.password };

        console.log("🔹 Request Payload:", payload);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            console.log("🔹 Response Received:", response);

            const data = await response.json();
            console.log("🔹 Response Data:", data);

            setLoading(false);

            if (!response.ok) {
                throw new Error(data.message || "An error occurred.");
            }

            if (isSignIn) {
                if (!data.user || !data.user.username || !data.user.id) {
                    throw new Error("Login successful, but no user data received.");
                }

                // ✅ Store user details for future requests
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user.id); // ✅ Store user ID
                localStorage.setItem("user", JSON.stringify(data.user));

                console.log("✅ User Logged In - ID:", data.user.id);
                setMessage(`Welcome, ${data.user.username}!`);
            } else {
                setMessage("Account created successfully! Please sign in.");
            }

            setIsSuccess(true);
        } catch (error) {
            setLoading(false);
            setMessage(error.message || "An error occurred while communicating with the server.");
            setIsSuccess(false);
            console.error("❌ Fetch Error:", error.message);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
            <h1>{isSignIn ? "Sign In" : "Create Account"}</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                {!isSignIn && (
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{ marginBottom: "10px", padding: "8px" }}
                    />
                )}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ marginBottom: "10px", padding: "10px" }} disabled={loading}>
                    {loading ? "Processing..." : isSignIn ? "Sign In" : "Create Account"}
                </button>
            </form>
            <button
                onClick={() => {
                    setIsSignIn(!isSignIn);
                    setMessage("");
                    setIsSuccess(null);
                }}
                style={{ padding: "10px", background: "none", border: "1px solid #ccc" }}
            >
                {isSignIn ? "Switch to Create Account" : "Switch to Sign In"}
            </button>
            {message && <p style={{ marginTop: "20px", color: isSuccess ? "green" : "red" }}>{message}</p>}
        </div>
    );
};

export default LoginPage;
