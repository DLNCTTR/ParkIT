// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <Link to="/" className="navbar-link">Home</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/login" className="navbar-link">Login</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/manage" className="navbar-link">Manage Parking</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/map" className="navbar-link">Map</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
