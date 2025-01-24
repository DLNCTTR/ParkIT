import React, { useState } from "react";

const LoginPage = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        password: "",
    });
    const [message, setMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/register";
        const method = "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(isSignIn ? "Login successful!" : "Account created successfully!");
            } else {
                setMessage(data.Message || "An error occurred.");
            }
        } catch (error) {
            setMessage("An error occurred while communicating with the server.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
            <h1>{isSignIn ? "Sign In" : "Create Account"}</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ marginBottom: "10px", padding: "10px" }}>
                    {isSignIn ? "Sign In" : "Create Account"}
                </button>
            </form>
            <button
                onClick={() => {
                    setIsSignIn(!isSignIn);
                    setMessage("");
                }}
                style={{ padding: "10px", background: "none", border: "1px solid #ccc" }}
            >
                {isSignIn ? "Switch to Create Account" : "Switch to Sign In"}
            </button>
            {message && <p style={{ marginTop: "20px" }}>{message}</p>}
        </div>
    );
};

export default LoginPage;

