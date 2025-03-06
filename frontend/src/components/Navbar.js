import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve the logged-in user's data

    const handleLogout = () => {
        localStorage.removeItem("user"); // Clear user data from localStorage
        localStorage.removeItem("token"); // Clear token from localStorage
        navigate("/login"); // Redirect to login page
    };

    return (
        <nav className="navbar">
            <ul className="navbar-list">
                {/* Always show Home */}
                <li className="navbar-item">
                    <Link to="/" className="navbar-link">Home</Link>
                </li>
                {/* Always show Map */}
                <li className="navbar-item">
                    <Link to="/map" className="navbar-link">Map</Link>
                </li>
                {/* Show Login only if user is not logged in */}
                {!user && (
                    <li className="navbar-item">
                        <Link to="/login" className="navbar-link">Login</Link>
                    </li>
                )}
                {/* Show Manage Parking and Logout if user is logged in */}
                {user && (
                    <>
                        <li className="navbar-item">
                            <Link to="/manage" className="navbar-link">Manage Parking</Link>
                        </li>
                        <li className="navbar-item">
                            <span className="navbar-text">Welcome, {user.username}!</span>
                        </li>
                        <li className="navbar-item">
                            <button onClick={handleLogout} className="navbar-link navbar-button">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
