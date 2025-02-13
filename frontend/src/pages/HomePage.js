import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";

const API_BASE_URL = "https://localhost:7155/api/homepage"; // ✅ Backend API
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""; // ✅ Load API key from env
const libraries = ["places"]; // ✅ Load Google Places API

const HomePage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]); // ✅ Stores all parking spaces
    const [filteredSpaces, setFilteredSpaces] = useState([]); // ✅ Stores search results
    const [searchQuery, setSearchQuery] = useState(""); // ✅ Search input state
    const [loading, setLoading] = useState(true); // ✅ Loading state
    const [error, setError] = useState(null); // ✅ Error state

    // ✅ Load Google Maps API once
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries,
    });

    // 🚀 Fetch parking spaces from API
    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/parking-spaces?onlyAvailable=true`);
                setParkingSpaces(response.data);
                setFilteredSpaces(response.data); // ✅ Show all by default
            } catch (err) {
                console.error("❌ Error fetching parking spaces:", err);
                setError("❌ Failed to fetch parking spaces. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSpaces();
    }, []);

    // 🔍 Handle search input change
    useEffect(() => {
        const filtered = parkingSpaces.filter((space) =>
            (space.formattedAddress || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (space.placeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (space.type || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSpaces(filtered);
    }, [searchQuery, parkingSpaces]);

    if (loading) {
        return <div>⏳ Loading parking spaces...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>📍 Available Parking Spaces</h1>

            {/* 🔍 Search Input */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="🔍 Search by address, place ID, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "100%",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                    }}
                />
            </div>

            {/* 🚗 Parking Spaces List */}
            {filteredSpaces.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {filteredSpaces.map((space) => (
                        <li
                            key={space.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                padding: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            <h2>{space.formattedAddress || "📍 Unknown Location"}</h2>
                            <p><strong>📌 Place ID:</strong> {space.placeId || "N/A"}</p>
                            <p><strong>💰 Price per Hour:</strong> €{space.pricePerHour.toFixed(2)}</p>
                            <p><strong>🚗 Capacity:</strong> {space.capacity}</p>
                            <p><strong>🟢 Availability:</strong> {space.availability ? "Available" : "Not Available"}</p>
                            <p><strong>📍 Coordinates:</strong> {space.latitude}, {space.longitude}</p>
                            <Link
                                to={`/parking/${space.id}`}
                                style={{
                                    color: "white",
                                    backgroundColor: "#007bff",
                                    padding: "10px 15px",
                                    textDecoration: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                🔍 View Details
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>❌ No parking spaces match your search.</p>
            )}
        </div>
    );
};

export default HomePage;
