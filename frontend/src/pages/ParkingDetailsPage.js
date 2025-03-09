import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";

const API_BASE_URL = "https://localhost:7155/api";
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: "100%",
    height: "500px",
};

const ParkingDetailsPage = () => {
    const { id } = useParams();
    const [parkingSpot, setParkingSpot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [travelMode, setTravelMode] = useState("DRIVING");
    const [eta, setEta] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // ✅ Use Google's optimized API loader
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey,
        libraries: ["places"]
    });

    useEffect(() => {
        const fetchParkingSpot = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/parking-spaces/${id}`);
                setParkingSpot(response.data);
            } catch (error) {
                console.error("❌ Failed to fetch parking spot:", error);
                setError("Failed to load parking spot details.");
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSpot();
    }, [id]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("❌ Error getting user location:", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const loadDirections = useCallback(() => {
        if (!isLoaded || !userLocation || !parkingSpot) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: userLocation,
                destination: { lat: parkingSpot.latitude, lng: parkingSpot.longitude },
                travelMode: window.google.maps.TravelMode[travelMode],
                provideRouteAlternatives: true,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    const leg = result.routes[0].legs[0];
                    setEta({
                        distance: leg.distance.text,
                        duration: leg.duration.text
                    });
                } else {
                    console.error("❌ Directions request failed:", status);
                }
            }
        );
    }, [isLoaded, userLocation, parkingSpot, travelMode]);

    useEffect(() => {
        if (isLoaded) {
            loadDirections();
        }
    }, [isLoaded, userLocation, parkingSpot, travelMode, loadDirections]);

    if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>⏳ Loading parking spot details...</div>;
    if (error || loadError) return <div style={{ color: "red", textAlign: "center", padding: "20px" }}>{error || "❌ Google Maps failed to load."}</div>;
    if (!parkingSpot) return <div style={{ textAlign: "center", padding: "20px" }}>❌ Parking spot not found.</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <h1>🚗 {parkingSpot.address}</h1>
            <p><strong>💰 Price per Hour:</strong> €{parkingSpot.pricePerHour}</p>
            <p><strong>📍 Coordinates:</strong> {parkingSpot.latitude}, {parkingSpot.longitude}</p>
            <p><strong>🏢 Type:</strong> {parkingSpot.type}</p>
            <p><strong>🚗 Current Capacity:</strong> {parkingSpot.currentCapacity}</p>
            <p><strong>🏠 Total Capacity:</strong> {parkingSpot.totalCapacity}</p>
            <p><strong>📝 Description:</strong> {parkingSpot.description || "No description available."}</p>
            <p><strong>🟢 Available:</strong> {parkingSpot.availability ? "✅ Yes" : "❌ No"}</p>


            {/* Travel Mode Selector */}
            <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "16px", fontWeight: "bold" }}>🚦 Travel Mode: </label>
                <select
                    onChange={(e) => setTravelMode(e.target.value)}
                    value={travelMode}
                    style={{
                        padding: "8px",
                        marginLeft: "10px",
                        fontSize: "16px",
                        borderRadius: "5px",
                        border: "1px solid #ccc"
                    }}
                >
                    <option value="DRIVING">🚗 Driving</option>
                    <option value="WALKING">🚶 Walking</option>
                    <option value="TRANSIT">🚌 Public Transit</option>
                </select>
            </div>

            {/* Display Estimated Arrival Time (ETA) */}
            {eta && (
                <div style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                    ⏳ Estimated Travel Time: {eta.duration} ({eta.distance})
                </div>
            )}

            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: parkingSpot.latitude, lng: parkingSpot.longitude }}
                    zoom={15}
                    onLoad={() => setMapLoaded(true)}
                >
                    {/* User's Current Location Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
                    )}

                    {/* Parking Spot Marker */}
                    <Marker position={{ lat: parkingSpot.latitude, lng: parkingSpot.longitude }} />

                    {/* Render Routes */}
                    {mapLoaded && directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            )}

            {/* Open in Google Maps Button */}
            <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${parkingSpot.latitude},${parkingSpot.longitude}&travelmode=${travelMode.toLowerCase()}`, "_blank")}
                style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    transition: "0.3s",
                    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)"
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
                📍 Open in Google Maps
            </button>
        </div>
    );
};

export default ParkingDetailsPage;
