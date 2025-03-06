import React, { useState } from "react";
import "../components/LoginPage.css";

const LoginPage = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setIsSuccess(null);

        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

        if (!API_BASE_URL) {
            setMessage("Internal error: API URL not configured.");
            setIsSuccess(false);
            setLoading(false);
            return;
        }

        const endpoint = isSignIn
            ? `${API_BASE_URL}/api/auth/login`
            : `${API_BASE_URL}/api/auth/register`;

        const payload = isSignIn
            ? { username: formData.username, password: formData.password }
            : { username: formData.username, email: formData.email, password: formData.password };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                throw new Error(data.message || "An error occurred.");
            }

            if (isSignIn) {
                if (!data.user || !data.user.username || !data.user.id) {
                    throw new Error("Login successful, but no user data received.");
                }
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("user", JSON.stringify(data.user));

                setMessage(`Welcome, ${data.user.username}!`);
            } else {
                setMessage("Account created successfully! Please sign in.");
            }

            setIsSuccess(true);
        } catch (error) {
            setLoading(false);
            setMessage(error.message || "An error occurred while communicating with the server.");
            setIsSuccess(false);
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">{isSignIn ? "Sign In" : "Create Account"}</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                />
                {!isSignIn && (
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                    />
                )}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Processing..." : isSignIn ? "Sign In" : "Create Account"}
                </button>
            </form>
            <button
                onClick={() => {
                    setIsSignIn(!isSignIn);
                    setMessage("");
                    setIsSuccess(null);
                }}
                className="switch-button"
            >
                {isSignIn ? "Switch to Create Account" : "Switch to Sign In"}
            </button>
            {message && <p className={`message ${isSuccess ? "success-message" : "error-message"}`}>{message}</p>}
        </div>
    );
};

export default LoginPage;
