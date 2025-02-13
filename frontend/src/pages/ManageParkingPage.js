import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Autocomplete, useLoadScript, Marker } from "@react-google-maps/api";

const API_BASE_URL = "https://localhost:7155/api";
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const mapContainerStyle = {
    width: "100%",
    height: "400px",
};

// ✅ Set Cork City as Default Location
const defaultCenter = { lat: 51.8985, lng: -8.4756 };

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // ✅ Updated Form to Include All Fields + Marker Position
    const [form, setForm] = useState({
        address: "",
        pricePerHour: "",
        type: "",
        capacity: "",
        availability: true,
        description: "",
        latitude: defaultCenter.lat, // 🗺️ Automatically updates from marker placement
        longitude: defaultCenter.lng, // 🗺️ Automatically updates from marker placement
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

    // ✅ Handle Place Selection from Autocomplete
    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                setError("❌ Selected place does not have location data.");
                return;
            }

            setForm((prevForm) => ({
                ...prevForm,
                address: place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            }));
        }
    };

    // ✅ Allow User to Click on Map to Move Marker
    const handleMapClick = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ Allow Marker to Be Dragged
    const handleMarkerDragEnd = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const payload = {
            ...form,
            pricePerHour: parseFloat(form.pricePerHour || "0"),
            capacity: parseInt(form.capacity || "0", 10),
            availability: form.availability === "true" || form.availability === true, // Convert to Boolean
        };

        const token = localStorage.getItem("token");

        try {
            if (isEditing && editingId) {
                await axios.put(`${API_BASE_URL}/parking/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("✅ Parking spot updated successfully.");
            } else {
                await axios.post(`${API_BASE_URL}/parking`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("✅ Parking spot added successfully.");
            }

            fetchParkingSpaces(userRole);
        } catch (error) {
            setError("❌ Failed to save the parking spot.");
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

                    {/* ✅ Display Google Map */}
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: form.latitude, lng: form.longitude }}
                        zoom={14}
                        onClick={handleMapClick} // Click on map moves marker
                    >
                        {/* ✅ Marker is now ALWAYS visible */}
                        <Marker
                            position={{ lat: form.latitude, lng: form.longitude }}
                            draggable={true}
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

                <button type="submit">{isEditing ? "Update" : "Add"} Parking Spot</button>
            </form>
        </div>
    );
};

export default ManageParkingPage;
