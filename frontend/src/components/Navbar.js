// frontend/src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import styles for the Navbar

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/manage">Manage Parking</Link></li>
                <li><Link to="/map">Map</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
