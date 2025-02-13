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

// ✅ Default center (San Francisco)
const defaultCenter = { lat: 37.7749, lng: -122.4194 };

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        address: "",
        formattedAddress: "",
        placeId: "",
        availability: true,
        pricePerHour: "",
        capacity: "",
        type: "",
        description: "",
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
    });

    // ✅ Load Google Maps API once
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
            console.error("❌ Error fetching user role:", error.response?.data || error);
            setError("❌ Failed to determine user role. Please log in again.");
        }
    };

    const fetchParkingSpaces = async (role) => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ Unauthorized: Please log in.");
            setLoading(false);
            return;
        }

        try {
            const endpoint = role === "Admin" ? `${API_BASE_URL}/parking-spaces` : `${API_BASE_URL}/parking`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setParkingSpaces(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("❌ Error fetching parking spaces:", error.response?.data || error);
            setError("❌ Failed to fetch parking spaces. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Google Maps Autocomplete Selection
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
                formattedAddress: place.formatted_address,
                placeId: place.place_id,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            }));
        }
    };

    // ✅ Handle Map Click to Drop Marker
    const handleMapClick = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ Handle Edit Click
    const handleEdit = (space) => {
        setForm({
            address: space.address,
            formattedAddress: space.formattedAddress,
            placeId: space.placeId,
            availability: space.availability,
            pricePerHour: space.pricePerHour,
            capacity: space.capacity,
            type: space.type,
            description: space.description,
            latitude: space.latitude,
            longitude: space.longitude,
        });
        setIsEditing(true);
        setEditingId(space.id);
    };

    // ✅ Handle Delete Click
    const handleDelete = async (id) => {
        if (!window.confirm("⚠️ Are you sure you want to delete this parking spot?")) return;

        const token = localStorage.getItem("token");

        try {
            await axios.delete(`${API_BASE_URL}/parking/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ Parking spot deleted successfully.");
            fetchParkingSpaces(userRole);
        } catch (error) {
            console.error("❌ Error deleting parking spot:", error.response?.data || error);
            setError("❌ Failed to delete the parking spot. Please try again.");
        }
    };

    // ✅ Ensure valid coordinates before submitting
    const validateCoordinates = (lat, lng) => {
        if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === Infinity || lng === Infinity) {
            return defaultCenter; // ✅ Return default coordinates if invalid
        }
        return { lat, lng };
    };

    // ✅ Handle form submission (Add / Edit)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // ✅ Validate Latitude & Longitude
        const { lat, lng } = validateCoordinates(form.latitude, form.longitude);

        const payload = {
            ...form,
            latitude: lat,
            longitude: lng,
            pricePerHour: parseFloat(form.pricePerHour || "0"),
            capacity: parseInt(form.capacity || "0", 10),
            availability: form.availability === true || form.availability === "true",
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

            resetForm();
            fetchParkingSpaces(userRole);
        } catch (error) {
            console.error("❌ Error saving parking spot:", error.response?.data || error);
            setError("❌ Failed to save the parking spot. Please try again.");
        }
    };

    // ✅ Reset Form Function
    const resetForm = () => {
        setForm({
            address: "",
            formattedAddress: "",
            placeId: "",
            availability: true,
            pricePerHour: "",
            capacity: "",
            type: "",
            description: "",
            latitude: defaultCenter.lat,
            longitude: defaultCenter.lng,
        });
        setIsEditing(false);
        setEditingId(null);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>{userRole === "Admin" ? "📌 All Parking Spaces" : "🚗 Manage Your Parking Spaces"}</h1>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            {isLoaded && (
                <>
                    <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
                        <input type="text" placeholder="Search Location" style={{ width: "100%", padding: "10px" }} />
                    </Autocomplete>

                    <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: form.latitude, lng: form.longitude }} zoom={12} onClick={handleMapClick}>
                        <MarkerF position={{ lat: form.latitude, lng: form.longitude }} />
                    </GoogleMap>
                </>
            )}
        </div>
    );
};

export default ManageParkingPage;
