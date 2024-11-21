import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ManageParkingPage from "./pages/ManageParkingPage"; // Updated import to match the detailed guide
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage"; // Import a new "Not Found" page

const App = () => {
    return (
        <Router>
            {/* Navigation bar for routing */}
            <Navbar />

            {/* Define application routes */}
            <Routes>
                <Route path="/" element={<HomePage />} /> {/* Home Page */}
                <Route path="/manage" element={<ManageParkingPage />} /> {/* Manage Parking Page */}
                <Route path="/login" element={<LoginPage />} /> {/* Login Page */}
                <Route path="/map" element={<MapPage />} /> {/* Map Page */}
                <Route path="*" element={<NotFoundPage />} /> {/* Fallback route for unmatched paths */}
            </Routes>
        </Router>
    );
};

export default App;
