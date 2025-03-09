import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import "../components/HomePage.css";

const API_BASE_URL = "https://localhost:7155/api/parking-spaces"; // Updated Base URL
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const libraries = ["places"];

const HomePage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [filteredSpaces, setFilteredSpaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterByProximity, setFilterByProximity] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    // ✅ Load Google Maps API
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries,
    });

    // 🚀 Fetch parking spaces from API (Standard Fetch)
    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}?onlyAvailable=true`);
                setParkingSpaces(response.data);
                setFilteredSpaces(response.data);
            } catch (err) {
                console.error("❌ Error fetching parking spaces:", err);
                setError("❌ Failed to fetch parking spaces. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSpaces();
    }, []);

    // 🌍 Fetch Nearby Parking Spots if Filter is Enabled
    useEffect(() => {
        if (filterByProximity && userLocation) {
            const fetchNearbyParkingSpaces = async () => {
                setLoading(true);
                try {
                    const { latitude, longitude } = userLocation;
                    const response = await axios.get(`${API_BASE_URL}/nearby`, {
                        params: { latitude, longitude, maxDistanceKm: 5 }
                    });
                    setFilteredSpaces(response.data);
                } catch (err) {
                    console.error("❌ Error fetching nearby parking spots:", err);
                    setError("❌ Failed to fetch nearby parking spots.");
                } finally {
                    setLoading(false);
                }
            };

            fetchNearbyParkingSpaces();
        }
    }, [filterByProximity, userLocation]);

    // 🔍 Handle search input change
    useEffect(() => {
        if (!filterByProximity) {
            const filtered = parkingSpaces.filter((space) =>
                (space.formattedAddress || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (space.placeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (space.type || "").toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredSpaces(filtered);
        }
    }, [searchQuery, parkingSpaces, filterByProximity]);

    // 📍 Get User Location for Proximity Filtering
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setFilterByProximity(true); // Enable filtering once location is retrieved
            },
            (error) => {
                console.error("❌ Error getting user location:", error);
                alert("Failed to retrieve your location. Ensure location services are enabled.");
            }
        );
    };

    if (loading) return <div className="loading-message">⏳ Loading parking spaces...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="homepage-container">
            <h1 className="homepage-title">📍 Available Parking Spaces</h1>

            {/* 🔍 Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="🔍 Search by address, place ID, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    disabled={filterByProximity} // Disable search when filtering by proximity
                />
            </div>

            {/* 🌍 Toggle Proximity Filter */}
            <div className="filter-container">
                <button
                    className="filter-button"
                    onClick={filterByProximity ? () => setFilterByProximity(false) : getUserLocation}
                >
                    {filterByProximity ? "🔄 Reset Filter" : "📍 Find Nearby Parking"}
                </button>
            </div>

            {/* 🚗 Parking Spaces List */}
            {filteredSpaces.length > 0 ? (
                <ul className="parking-list">
                    {filteredSpaces.map((space) => (
                        <li key={space.id} className="parking-card">
                            <h2>{space.address || "📍 Unknown Location"}</h2>
                            <p><strong>💰 Price per Hour:</strong> €{space.pricePerHour.toFixed(2)}</p>
                            <p><strong>🟢 Availability:</strong> {space.availability ? "Available" : "Not Available"}</p>
                            <p><strong>🚗 Current Capacity:</strong> {space.currentCapacity}</p>
                            <p><strong>🏢 Total Capacity:</strong> {space.totalCapacity}</p>
                            <Link to={`/parking/${space.id}`} className="view-details-button">
                                🔍 View Details
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-results-message">❌ No parking spaces match your search.</p>
            )}
        </div>
    );
};

export default HomePage;
