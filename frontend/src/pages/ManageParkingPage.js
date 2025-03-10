import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Autocomplete, useLoadScript, MarkerF } from "@react-google-maps/api";
import "../components/ManageParkingPage.css";


const API_BASE_URL = "https://localhost:7155/api";
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const mapContainerStyle = {
    width: "100%",  // ✅ Ensures the map is full width of its container
    maxWidth: "1100px",  // ✅ Adds a max width to prevent stretching too much
    height: "400px",  // ✅ Increase the height for a bigger map
    margin: "0 auto", // ✅ Center the map
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
        pricePerHour: "",
        type: "",
        totalCapacity: "",  // ✅ Renamed from "capacity"
        currentCapacity: "",
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

            console.log("🚀 API Response:", response.data); // Debugging

            const spaces = Array.isArray(response.data) ? response.data : [];

            // ✅ Ensure each spot has totalCapacity and description correctly assigned
            const updatedSpaces = spaces.map(spot => ({
                ...spot,
                totalCapacity: spot.totalCapacity || 1,  // ✅ Ensure totalCapacity is always available
                description: spot.description ? String(spot.description) : "",  // ✅ Ensure description is a string
            }));

            setParkingSpaces(updatedSpaces);
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

    // ✅ Validate Current Capacity 
    const handleCurrentCapacityChange = (e) => {
        const currentValue = parseInt(e.target.value, 10);
        setForm((prevForm) => ({
            ...prevForm,
            currentCapacity: currentValue,
        }));
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
            totalCapacity: Math.max(1, parseInt(form.totalCapacity, 10)),  // ✅ Ensures at least 1
            currentCapacity: parseInt(form.currentCapacity, 10) || 0,  // ✅ Allows 0
            availability: form.availability === "true" || form.availability === true,
            description: String(form.description || ""),
            latitude: isFinite(form.latitude) ? form.latitude : 51.8985,
            longitude: isFinite(form.longitude) ? form.longitude : -8.4756,
            userId: parseInt(userId),
        };

        console.log("Submitting Payload:", payload);

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

        console.log("Editing Spot Data:", spot);

        setForm({
            address: spot.address || "",
            formattedAddress: spot.formattedAddress || "",
            placeId: spot.placeId || "",
            pricePerHour: spot.pricePerHour || 0,
            type: spot.type || "",
            totalcapacity: spot.totalCapacity || 1,
            currentCapacity: spot.currentCapacity || 0,
            availability: spot.availability ?? true, // Preserve availability status
            description: spot.description ? String(spot.description) : "",
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
        <div className="content-wrapper"> {/* ✅ Prevents navbar overlap */}
            <div className="manage-container">
                <h1 className="manage-title">🚗 Manage Your Parking Spaces</h1>

                {error && <div className="error-message">{error}</div>}

                {isLoaded ? (
                    <div> {/* ✅ Ensure the container div is correctly opened and closed */}
                        {/* ✅ Styled Search Input */}
                        <div className="search-container">
                            <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceSelect}>
                                <input type="text" placeholder="🔍 Search Location" className="search-input"/>
                            </Autocomplete>
                        </div>

                        {/* ✅ Google Map with Black Border */}
                        <div className="map-container">
                            <GoogleMap
                                className="map-frame"
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
                        </div>
                    </div> /* ✅ Ensure this div is properly closed */
                ) : (
                    <p>Loading map...</p>
                )}


                <form className="manage-form" onSubmit={handleFormSubmit}>
                    <h3>{isEditing ? "✏️ Edit Parking Spot" : "➕ Add Parking Spot"}</h3>

                    <input type="text" placeholder="Address" className="input-field" value={form.address}
                           onChange={(e) => setForm({...form, address: e.target.value})} required/>

                    <input type="number" placeholder="€ Price Per Hour" className="input-field"
                           value={form.pricePerHour}
                           onChange={(e) => setForm({...form, pricePerHour: e.target.value})} required/>

                    <input type="text" placeholder="Type (Garage, Street, etc.)" className="input-field"
                           value={form.type}
                           onChange={(e) => setForm({...form, type: e.target.value})} required/>

                    <input type="number" placeholder="Total Capacity" className="input-field" value={form.totalCapacity}
                           onChange={(e) => setForm({...form, totalCapacity: e.target.value})} min="1" required/>

                    <input type="number" placeholder="Current Capacity" className="input-field"
                           value={form.currentCapacity}
                           onChange={handleCurrentCapacityChange} min="0" required/>


                    <select className="input-field" value={form.availability}
                            onChange={(e) => setForm({...form, availability: e.target.value})} required>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>

                    <textarea placeholder="Description (Optional)" className="input-field" value={form.description}
                              onChange={(e) => setForm({...form, description: e.target.value})}></textarea>

                    <button type="submit" className="btn-primary">
                        {isEditing ? "Update" : "Add"} Parking Spot
                    </button>
                </form>

                {/* ✅ New Parking Spots List Section */}
                <h3>📍 Your Parking Spots</h3>
                <table border="1" style={{width: "100%", marginTop: "10px"}}>
                    <thead>
                    <tr>
                        <th>Address</th>
                        <th>Type</th>
                        <th>T.Capacity</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {parkingSpaces.map((spot) => (
                        <tr key={spot.id}>
                            <td>{spot.address}</td>
                            <td>{spot.type}</td>
                            <td>{spot.totalCapacity}</td>
                            <td>€{spot.pricePerHour}</td>
                            <td>
                                <button onClick={() => handleEdit(spot)}>✏️ Edit</button>
                                <button onClick={() => handleDelete(spot.id)}>❌ Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

            export default ManageParkingPage;
