import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ParkingDetailsPage = () => {
    const { id } = useParams(); // Get the parking space ID from the URL
    const [parkingSpace, setParkingSpace] = useState(null); // State to hold parking space details
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        // Fetch parking space details from the API
        const fetchParkingSpaceDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7155/api/parking/${id}`);
                setParkingSpace(response.data);
            } catch (err) {
                console.error("Error fetching parking space details:", err);
                setError("Failed to load parking space details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSpaceDetails();
    }, [id]);

    if (loading) {
        return <div>Loading parking space details...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            {/* Display the placeholder image */}
            <img
                src="/images/Map.jpg"
                alt="Parking Spot Placeholder"
                style={{
                    width: "100%",
                    height: "auto",
                    marginBottom: "20px",
                    borderRadius: "8px",
                }}
            />

            {/* Display parking space details */}
            <h1>{parkingSpace.location}</h1>
            <p><strong>Description:</strong> {parkingSpace.description}</p>
            <p><strong>Price per Hour:</strong> €{parkingSpace.pricePerHour}</p>
            <p><strong>Type:</strong> {parkingSpace.type}</p>
            <p><strong>Capacity:</strong> {parkingSpace.capacity}</p>
            <p><strong>Availability:</strong> {parkingSpace.availability ? "Available" : "Not Available"}</p>

            {/* Back to home button */}
            <Link
                to="/"
                style={{
                    display: "inline-block",
                    marginTop: "20px",
                    padding: "10px 15px",
                    backgroundColor: "#007bff",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                }}
            >
                Back to Home
            </Link>
        </div>
    );
};

export default ParkingDetailsPage;
