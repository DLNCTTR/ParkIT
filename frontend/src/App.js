// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ManageParkingPage from "./pages/ManageParkingPage";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import ParkingDetailsPage from "./pages/ParkingDetailsPage";
const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/manage" element={<ManageParkingPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/parking/:id" element={<ParkingDetailsPage />} />
                <Route path="/parking-details/:id" element={<ParkingDetailsPage />} />
            </Routes>
        </Router>
    );
};

export default App;
