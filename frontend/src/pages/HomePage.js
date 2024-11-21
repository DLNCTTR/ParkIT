import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// HomePage component to display available parking spaces
const HomePage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]); // State for parking spaces
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling

    // Fetch parking spaces from the API
    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await axios.get("https://localhost:7155/api/parking");
                setParkingSpaces(response.data); // Set the fetched data to state
            } catch (error) {
                console.error("Error fetching parking spaces:", error);
                setError("Failed to fetch parking spaces. Please try again later.");
            } finally {
                setLoading(false); // Disable loading indicator
            }
        };

        fetchParkingSpaces();
    }, []);

    // Render loading state
    if (loading) {
        return <div>Loading parking spaces...</div>;
    }

    // Render error state
    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Available Parking Spaces</h1>
            {parkingSpaces.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {parkingSpaces.map((space) => (
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
                            <p><strong>Description:</strong> {space.description}</p>
                            <p><strong>Price per Hour:</strong> €{space.pricePerHour}</p>
                            <p><strong>Type:</strong> {space.type}</p>
                            <p><strong>Capacity:</strong> {space.capacity}</p>
                            <p>
                                <strong>Availability:</strong>{" "}
                                {space.availability ? "Available" : "Not Available"}
                            </p>
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
                <p>No parking spaces available at the moment.</p>
            )}
        </div>
    );
};

export default HomePage;