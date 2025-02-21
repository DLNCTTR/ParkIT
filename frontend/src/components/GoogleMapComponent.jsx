import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { getAllParkingSpots } from "../api"; // Fetch parking spaces from API
import { useNavigate } from "react-router-dom";

const mapContainerStyle = {
    width: "100%",
    height: "500px",
};

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const GoogleMapComponent = () => {
    const [parkingSpots, setParkingSpots] = useState([]);
    const [isApiKeyValid, setIsApiKeyValid] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!googleMapsApiKey) {
            console.error("❌ Google Maps API Key is missing! Check .env file.");
            setIsApiKeyValid(false);
        }

        const fetchParkingSpots = async () => {
            const spots = await getAllParkingSpots();
            console.log("✅ Parking Spots Fetched:", spots); // 🔍 Log spots to console
            setParkingSpots(spots);
        };

        fetchParkingSpots();

        // ✅ Auto-refresh every 30 seconds
        const interval = setInterval(fetchParkingSpots, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isApiKeyValid) {
        return <div style={{ color: "red", textAlign: "center" }}>❌ Error: Google Maps API Key is missing or invalid.</div>;
    }

    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap mapContainerStyle={mapContainerStyle} center={defaultCenter} zoom={12}>
                {/* ✅ Debug Log */}
                {console.log("🔍 Rendering Markers:", parkingSpots)}

                {/* ✅ Render markers for each parking spot */}
                {parkingSpots.length > 0 ? (
                    parkingSpots.map((spot) => (
                        <Marker
                            key={spot.id}
                            position={{ lat: spot.latitude, lng: spot.longitude }}
                            title={spot.address}
                            onClick={() => navigate(`/parking/${spot.id}`)} // Redirect to details page
                        />
                    ))
                ) : (
                    <p>No parking spots found.</p>
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default GoogleMapComponent;
