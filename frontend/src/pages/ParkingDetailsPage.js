import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // ✅ Use axios for fetching data
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const API_BASE_URL = "https://localhost:7155/api"; // ✅ Ensure correct API URL

const mapContainerStyle = {
    width: "100%",
    height: "500px",
};

// ✅ Load API Key from environment variables
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const ParkingDetailsPage = () => {
    const { id } = useParams();
    const [parkingSpot, setParkingSpot] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParkingSpot = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/parking-spaces/${id}`);
                setParkingSpot(response.data);
            } catch (error) {
                console.error("❌ Failed to fetch parking spot:", error);
                setError("❌ Failed to load parking details.");
            }
        };

        fetchParkingSpot();
    }, [id]);

    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!parkingSpot) return <div>Loading...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>🚗 {parkingSpot.address}</h1>
            <p><strong>Price per Hour:</strong> ${parkingSpot.pricePerHour}</p>
            <p><strong>Type:</strong> {parkingSpot.type}</p>
            <p><strong>Capacity:</strong> {parkingSpot.capacity}</p>
            <p><strong>Available:</strong> {parkingSpot.availability ? "Yes ✅" : "No ❌"}</p>

            {/* ✅ Display Google Map with Parking Spot Marker */}
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: parkingSpot.latitude, lng: parkingSpot.longitude }}
                    zoom={15}
                >
                    <Marker position={{ lat: parkingSpot.latitude, lng: parkingSpot.longitude }} />
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default ParkingDetailsPage;
