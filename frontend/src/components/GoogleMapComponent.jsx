import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
    width: "100%",
    height: "400px",
};

// Default center (San Francisco)
const defaultCenter = {
    lat: 37.7749, // Replace with your latitude
    lng: -122.4194, // Replace with your longitude
};

// ✅ Securely load API Key from environment variables
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const GoogleMapComponent = () => {
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [isApiKeyValid, setIsApiKeyValid] = useState(true);

    // ✅ Ensure Google Maps API key is properly loaded
    useEffect(() => {
        if (!googleMapsApiKey) {
            console.error("❌ Google Maps API Key is missing! Check .env file.");
            setIsApiKeyValid(false);
        }
    }, []);

    if (!isApiKeyValid) {
        return <div style={{ color: "red", textAlign: "center" }}>❌ Error: Google Maps API Key is missing or invalid.</div>;
    }

    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey} loading="async" defer>
            <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={12}>
                {/* ✅ Add a Marker at the center */}
                <Marker position={mapCenter} />
            </GoogleMap>
        </LoadScript>
    );
};

export default GoogleMapComponent;
