import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Autocomplete, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/MapPage.css";

const API_BASE_URL = "https://localhost:7155/api"; // ✅ API Base URL

const mapContainerStyle = {
    width: "100%",
    height: "500px",
};

// ✅ Always Start Map in Cork (Default)
const defaultCenter = { lat: 51.8985, lng: -8.4756 };

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"]; // Required for search bar (Autocomplete)

const MapPage = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries,
    });

    const [parkingSpots, setParkingSpots] = useState([]);
    const [searchBox, setSearchBox] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [zoomLevel, setZoomLevel] = useState(12);
    const [markersLoaded, setMarkersLoaded] = useState(false);
    const navigate = useNavigate();

    // ✅ Fetch all parking spots when component mounts
    useEffect(() => {
        const fetchParkingSpots = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/parking-spaces`);
                const spots = response.data || [];

                console.log("✅ Raw Parking Spots from API:", spots);

                // ✅ Ensure valid latitude & longitude
                const validSpots = spots
                    .filter(spot => spot.latitude && spot.longitude && spot.latitude !== 0 && spot.longitude !== 0)
                    .map(spot => ({
                        id: spot.id,
                        address: spot.address,
                        lat: parseFloat(spot.latitude),
                        lng: parseFloat(spot.longitude),
                    }));

                console.log("✅ Filtered Parking Spots:", validSpots);

                setParkingSpots(validSpots);
                setMarkersLoaded(true); // ✅ Markers are ready
            } catch (error) {
                console.error("❌ Failed to fetch parking spots:", error);
            }
        };

        fetchParkingSpots();
    }, []);

    // ✅ Ensure Markers update when `parkingSpots` changes
    useEffect(() => {
        if (parkingSpots.length > 0) {
            console.log("📍 Markers Updated:", parkingSpots);
            setMarkersLoaded(true);
        }
    }, [parkingSpots]);

    // ✅ Handle search selection
    const handlePlaceSelect = () => {
        if (searchBox) {
            const place = searchBox.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            console.log("📍 New Map Center:", place.geometry.location.lat(), place.geometry.location.lng());

            // ✅ Center the map on selected location
            setMapCenter({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            });
            setZoomLevel(14); // ✅ Zoom in to the selected area
        }
    };

    // ✅ Handle marker click (Redirect to Parking Details Page)
    const handleMarkerClick = (spotId) => {
        navigate(`/parking-details/${spotId}`);
    };

    // ✅ Handle Google Maps Loading Error
    if (loadError) {
        return <div>❌ Failed to load Google Maps</div>;
    }

    // ✅ Show Loading Until Google Maps is Ready
    if (!isLoaded) {
        return <div>Loading Map...</div>;
    }

    console.log("🟢 Ready to Render Markers:", parkingSpots);

    return (
        <div className="map-container">
            <h1 className="map-title">🗺️ Available Parking Spots</h1>

            {/* ✅ Search Bar */}
            <div className="search-container">
                <Autocomplete onLoad={(box) => setSearchBox(box)} onPlaceChanged={handlePlaceSelect}>
                    <input type="text" placeholder="🔍 Search Location" className="search-input" />
                </Autocomplete>
            </div>

            {/* ✅ Google Map with Proper Framing */}
            <div className="map-frame">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={zoomLevel}
                >
                    {/* ✅ Ensure markers appear after the map is loaded */}
                    {markersLoaded && parkingSpots.length > 0 ? (
                        parkingSpots.map((spot) => {
                            console.log("📍 Rendering Marker:", spot);
                            return (
                                <Marker
                                    key={spot.id}
                                    position={{ lat: parseFloat(spot.lat), lng: parseFloat(spot.lng) }}
                                    title={spot.address}
                                    onClick={() => handleMarkerClick(spot.id)}
                                />
                            );
                        })
                    ) : (
                        console.log("⚠️ Markers Not Ready or Empty", parkingSpots)
                    )}
                </GoogleMap>
            </div>
            <p style={{ marginTop: "20px", fontSize: "20px", fontWeight: "bold", color: "#333", textAlign: "center" }}>
                Select a marker to get more details!
            </p>
        </div>
    );

};

export default MapPage;
