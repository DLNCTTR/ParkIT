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

// ✅ Default location (Cork City)
const defaultCenter = { lat: 51.8985, lng: -8.4756 };

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // ✅ Initialize Form State
    const [form, setForm] = useState({
        address: "",
        formattedAddress: "",
        placeId: "",
        pricePerHour: 0,
        type: "",
        capacity: 1,
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
        fetchParkingSpaces();
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

    const fetchParkingSpaces = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ Unauthorized: Please log in.");
            return;
        }

        try {
            const endpoint =
                userRole === "Admin"
                    ? `${API_BASE_URL}/parking-spaces/all`
                    : `${API_BASE_URL}/parking-spaces/my-spots`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setParkingSpaces(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError("❌ Failed to fetch parking spaces.");
        }
    };

    // ✅ Handle Google Places Autocomplete Selection
    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                setError("❌ Selected place does not have location data.");
                return;
            }

            setForm((prevForm) => ({
                ...prevForm,
                address: place.formatted_address || "Unknown Address",
                formattedAddress: place.formatted_address || "",
                placeId: place.place_id || "",
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            }));
        }
    };

    // ✅ Handle Map Click to Move Marker
    const handleMapClick = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ Handle Marker Dragging
    const handleMarkerDragEnd = (event) => {
        setForm((prevForm) => ({
            ...prevForm,
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
        }));
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!userId) {
            setError("❌ User ID is missing. Please log in again.");
            return;
        }

        const payload = {
            address: form.address || "Unknown Address",
            formattedAddress: form.formattedAddress || "Unknown",
            placeId: form.placeId || "Unknown",
            pricePerHour: isNaN(parseFloat(form.pricePerHour)) ? 0 : parseFloat(form.pricePerHour),
            type: form.type || "Unknown",
            capacity: isNaN(parseInt(form.capacity, 10)) ? 1 : parseInt(form.capacity, 10),
            availability: form.availability === "true" || form.availability === true,
            description: form.description || "No description available",
            latitude: isFinite(form.latitude) ? form.latitude : 51.8985,
            longitude: isFinite(form.longitude) ? form.longitude : -8.4756,
            userId: parseInt(userId),
        };

        try {
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/parking-spaces/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("✅ Parking spot updated successfully.");
            } else {
                await axios.post(`${API_BASE_URL}/parking`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("✅ Parking spot added successfully.");
            }
            window.location.reload();

        } catch (error) {
            console.error("❌ Failed to save parking spot:", error.response?.data || error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    };

    // ✅ Handle Edit
    const handleEdit = (spot) => {
        setIsEditing(true);
        setEditingId(spot.id);

        setForm({
            address: spot.address || "",
            formattedAddress: spot.formattedAddress || "",
            placeId: spot.placeId || "",
            pricePerHour: spot.pricePerHour || 0,
            type: spot.type || "",
            capacity: spot.capacity || 1,
            availability: spot.availability ?? true, // Preserve availability status
            description: spot.description || "", // ✅ Ensure description is preserved
            latitude: spot.latitude || defaultCenter.lat,
            longitude: spot.longitude || defaultCenter.lng,
        });
    };


    // ✅ Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this spot?")) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_BASE_URL}/parking-spaces/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ Parking spot deleted successfully.");
            fetchParkingSpaces(); // Refresh list
            window.location.reload();
        } catch (error) {
            console.error("❌ Failed to delete parking spot:", error);
            setError("Failed to delete parking spot.");
        }
    };

    return (
        <div style={{padding: "20px"}}>
            <h1>🚗 Manage Your Parking Spaces</h1>

            {error && <div style={{color: "red", marginBottom: "10px"}}>{error}</div>}

            {isLoaded ? (
                <>
                    <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
                        <input type="text" placeholder="Search Location" style={{width: "100%", padding: "10px"}}/>
                    </Autocomplete>

                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{lat: form.latitude, lng: form.longitude}}
                        zoom={14}
                        onClick={handleMapClick}
                    >
                        <MarkerF
                            position={{lat: form.latitude, lng: form.longitude}}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                        />
                    </GoogleMap>
                </>
            ) : (
                <p>Loading map...</p>
            )}

            <form onSubmit={handleFormSubmit} style={{marginTop: "20px", padding: "10px", border: "1px solid gray"}}>
                <h3>{isEditing ? "✏️ Edit Parking Spot" : "➕ Add Parking Spot"}</h3>

                <input type="text" placeholder="Address" value={form.address}
                       onChange={(e) => setForm({...form, address: e.target.value})} required/>
                <input type="number" placeholder="Price Per Hour" value={form.pricePerHour}
                       onChange={(e) => setForm({...form, pricePerHour: e.target.value})} required/>
                <input type="text" placeholder="Type (Garage, Street, etc.)" value={form.type}
                       onChange={(e) => setForm({...form, type: e.target.value})} required/>
                <input type="number" placeholder="Capacity" value={form.capacity}
                       onChange={(e) => setForm({...form, capacity: e.target.value})} required/>

                <select value={form.availability} onChange={(e) => setForm({...form, availability: e.target.value})}
                        required>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                </select>

                <textarea placeholder="Description" value={form.description}
                          onChange={(e) => setForm({...form, description: e.target.value})} required></textarea>

                <button type="submit">{isEditing ? "Update" : "Add"} Parking Spot</button>
            </form>

            {/* ✅ New Parking Spots List Section */}
            <h3>📍 Your Parking Spots</h3>
            <table border="1" style={{width: "100%", marginTop: "20px"}}>
                <thead>
                <tr>
                    <th>Address</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {parkingSpaces.map((spot) => (
                    <tr key={spot.id}>
                        <td>{spot.address}</td>
                        <td>${spot.pricePerHour}</td>
                        <td>
                            <button onClick={() => handleEdit(spot)}>✏️ Edit</button>
                            <button onClick={() => handleDelete(spot.id)}>❌ Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageParkingPage;
