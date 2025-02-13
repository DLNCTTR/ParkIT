import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Autocomplete, useLoadScript, MarkerF } from "@react-google-maps/api";

const API_BASE_URL = "https://localhost:7155/api";
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const mapContainerStyle = {
    width: "100%",
    height: "400px",
};

// ✅ Cork City as Default Location
const defaultCenter = { lat: 51.8985, lng: -8.4756 };

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // ✅ Ensure Marker Starts at the Center
    const [form, setForm] = useState({
        address: "",
        pricePerHour: "",
        type: "",
        capacity: "",
        availability: true,
        description: "",
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
    });

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey,
        libraries,
    });

    useEffect(() => {
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ Unauthorized: Please log in.");
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/auth/user-role`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUserRole(response.data.role);
            fetchParkingSpaces(response.data.role);
        } catch (error) {
            setError("❌ Failed to determine user role.");
        }
    };

    const fetchParkingSpaces = async (role) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ Unauthorized: Please log in.");
            return;
        }

        try {
            const endpoint = role === "Admin" ? `${API_BASE_URL}/parking-spaces` : `${API_BASE_URL}/parking`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setParkingSpaces(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError("❌ Failed to fetch parking spaces.");
        }
    };

    // ✅ When user selects a place from Autocomplete
    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                setError("❌ Selected place does not have location data.");
                return;
            }

            setForm((prevForm) => ({
                ...prevForm,
                address: place.formatted_address || place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            }));
        }
    };

    // ✅ When user clicks on the map, move the marker & update form state
    const handleMapClick = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ When user drags the marker, update its position
    const handleMarkerDragEnd = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ Debugging added inside `handleFormSubmit`
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 handleFormSubmit triggered!");

        setError(null);

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!userId) {
            setError("❌ User ID is missing. Please log in again.");
            console.error("❌ User ID is missing.");
            return;
        }

        console.log("✅ User ID found:", userId);

        // ✅ Ensure valid numbers (prevent NaN/Infinity issues)
        const pricePerHour = isNaN(parseFloat(form.pricePerHour)) ? 0 : parseFloat(form.pricePerHour);
        const capacity = isNaN(parseInt(form.capacity, 10)) ? 1 : parseInt(form.capacity, 10);
        const latitude = isFinite(form.latitude) ? form.latitude : 51.8985;
        const longitude = isFinite(form.longitude) ? form.longitude : -8.4756;

        const payload = {
            address: form.address || "Unknown Address",
            pricePerHour,
            type: form.type || "Unknown",
            capacity,
            availability: form.availability === "true" || form.availability === true,
            description: form.description || "No description available",
            latitude,
            longitude,
            userId: parseInt(userId),
        };

        console.log("📡 Sending API Request with Payload:", payload);

        try {
            let response;
            if (isEditing && editingId) {
                console.log(`✏️ Updating Parking Spot (ID: ${editingId})`);
                response = await axios.put(`${API_BASE_URL}/parking/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                console.log("➕ Adding New Parking Spot...");
                response = await axios.post(`${API_BASE_URL}/parking`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            console.log("✅ API Response:", response.data);
            alert("✅ Parking spot saved successfully.");
            fetchParkingSpaces(userRole);
        } catch (error) {
            console.error("❌ Failed to save parking spot:", error.response?.data || error);
            setError(error.response?.data?.message || "An error occurred while saving the parking spot.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>🚗 Manage Your Parking Spaces</h1>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            {isLoaded ? (
                <>
                    <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
                        <input type="text" placeholder="Search Location" style={{ width: "100%", padding: "10px" }} />
                    </Autocomplete>

                    {/* ✅ Google Map with Clickable & Draggable Marker */}
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: form.latitude, lng: form.longitude }}
                        zoom={14}
                        onClick={handleMapClick} // Click on map moves marker
                    >
                        <MarkerF
                            position={{ lat: form.latitude, lng: form.longitude }}
                            draggable={true} // ✅ Make marker draggable
                            onDragEnd={handleMarkerDragEnd}
                        />
                    </GoogleMap>
                </>
            ) : (
                <p>Loading map...</p>
            )}

            <form onSubmit={handleFormSubmit} style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
                <h3>{isEditing ? "✏️ Edit Parking Spot" : "➕ Add Parking Spot"}</h3>

                <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                <input type="number" placeholder="Price Per Hour" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} required />
                <input type="text" placeholder="Type (Garage, Street, etc.)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
                <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />

                {/* ✅ Availability and Description fields are untouched */}
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} required>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                </select>

                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required></textarea>

                <button type="submit">{isEditing ? "Update" : "Add"} Parking Spot</button>
            </form>
        </div>
    );
};

export default ManageParkingPage;
