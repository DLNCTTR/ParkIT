import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]); // State for all parking spaces
    const [filteredSpaces, setFilteredSpaces] = useState([]); // State for search results
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for error messages

    const API_BASE_URL = "https://localhost:7155/api/HomePage"; // ✅ Updated API endpoint

    // Fetch parking spaces from the API on component mount
    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/parking-spaces`);
                setParkingSpaces(response.data);
                setFilteredSpaces(response.data); // Display all initially
            } catch (error) {
                console.error("Error fetching parking spaces:", error);
                setError("Failed to fetch parking spaces. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSpaces();
    }, []);

    // Search filter
    useEffect(() => {
        const filtered = parkingSpaces.filter((space) =>
            space.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSpaces(filtered);
    }, [searchQuery, parkingSpaces]);

    if (loading) {
        return <div>Loading parking spaces...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Available Parking Spaces</h1>

            {/* Search Input */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search by location..."
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

            {/* Parking Spaces List */}
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
                            <h2>{space.location}</h2>
                            <p><strong>Price per Hour:</strong> €{space.pricePerHour}</p>
                            <p><strong>Capacity:</strong> {space.capacity}</p>
                            <p><strong>Availability:</strong> {space.availability ? "Available" : "Not Available"}</p>
                            <p><strong>Latitude:</strong> {space.latitude}</p>
                            <p><strong>Longitude:</strong> {space.longitude}</p>
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
                                View Details
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No parking spaces match your search.</p>
            )}
        </div>
    );
};

export default HomePage;
