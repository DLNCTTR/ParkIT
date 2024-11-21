import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [form, setForm] = useState({
        location: "",
        availability: true,
        pricePerHour: "",
        owner: "",
        capacity: "",
        type: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null); // Separate state for editing ID

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:7155/api/parking/";

    useEffect(() => {
        fetchParkingSpaces();
    }, []);

    const fetchParkingSpaces = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setParkingSpaces(response.data);
        } catch (error) {
            console.error("Error fetching parking spaces:", error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Construct the payload
        const payload = {
            location: form.location,
            pricePerHour: parseFloat(form.pricePerHour || "0"),
            capacity: parseInt(form.capacity || "0", 10),
            availability: form.availability === true || form.availability === "true",
            type: form.type,
            owner: form.owner || null,
            description: form.description || null,
        };

        // Add the ID only when editing
        if (isEditing) {
            payload.id = editingId;
        }

        // Validate the payload
        if (!payload.location || payload.location.length > 100) {
            alert("Location is required and cannot exceed 100 characters.");
            return;
        }
        if (!payload.pricePerHour || payload.pricePerHour < 0 || payload.pricePerHour > 1000) {
            alert("Price per hour must be between 0 and 1000.");
            return;
        }
        if (!payload.type || payload.type.length > 50) {
            alert("Type is required and cannot exceed 50 characters.");
            return;
        }
        if (!payload.capacity || payload.capacity <= 0) {
            alert("Capacity is required and must be a positive number.");
            return;
        }

        try {
            if (isEditing && editingId) {
                // Update existing parking spot
                await axios.put(`${API_BASE_URL}${editingId}`, payload);
                alert("Parking spot updated successfully.");
            } else {
                // Create new parking spot
                await axios.post(API_BASE_URL, payload);
                alert("Parking spot added successfully.");
            }

            // Reset the form
            setForm({
                location: "",
                availability: true,
                pricePerHour: "",
                owner: "",
                capacity: "",
                type: "",
                description: "",
            });
            setIsEditing(false);
            setEditingId(null);
            fetchParkingSpaces();
        } catch (error) {
            console.error("Error saving parking spot:", error.response?.data?.errors || error.response?.data || error);
            alert(`Failed to save the parking spot: ${error.response?.data?.title || "Unknown error"}`);
        }
    };

    const handleEdit = (space) => {
        // Populate the form with the existing data
        setForm({
            location: space.location,
            availability: space.availability,
            pricePerHour: space.pricePerHour,
            owner: space.owner,
            capacity: space.capacity,
            type: space.type,
            description: space.description,
        });
        setIsEditing(true);
        setEditingId(space.id); // Set the ID for editing
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this parking spot?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}${id}`);
            alert("Parking spot deleted successfully.");
            fetchParkingSpaces();
        } catch (error) {
            console.error("Error deleting parking spot:", error);
            alert("Failed to delete the parking spot. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Manage Parking Spaces</h1>
            <form onSubmit={handleFormSubmit} style={{ marginBottom: "20px" }}>
                <h2>{isEditing ? "Edit Parking Spot" : "Add New Parking Spot"}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Location"
                        required
                    />
                    <select
                        name="availability"
                        value={form.availability}
                        onChange={(e) => setForm({ ...form, availability: e.target.value === "true" })}
                    >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                    </select>
                    <input
                        type="number"
                        name="pricePerHour"
                        value={form.pricePerHour}
                        onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                        placeholder="Price per Hour (€)"
                        required
                    />
                    <input
                        type="text"
                        name="owner"
                        value={form.owner}
                        onChange={(e) => setForm({ ...form, owner: e.target.value })}
                        placeholder="Owner"
                    />
                    <input
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        placeholder="Capacity"
                        required
                    />
                    <input
                        type="text"
                        name="type"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        placeholder="Type"
                        required
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Description"
                        rows="3"
                    />
                </div>
                <button type="submit" style={{ marginTop: "10px" }}>
                    {isEditing ? "Save Changes" : "Add Parking Spot"}
                </button>
            </form>
            <h2>Existing Parking Spaces</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {parkingSpaces.map((space) => (
                    <li key={space.id} style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "15px", marginBottom: "10px" }}>
                        <p><strong>Location:</strong> {space.location}</p>
                        <p><strong>Availability:</strong> {space.availability ? "Yes" : "No"}</p>
                        <p><strong>Price per Hour:</strong> €{space.pricePerHour}</p>
                        <p><strong>Owner:</strong> {space.owner}</p>
                        <p><strong>Capacity:</strong> {space.capacity}</p>
                        <p><strong>Type:</strong> {space.type}</p>
                        <p><strong>Description:</strong> {space.description}</p>
                        <button type="button" onClick={() => handleEdit(space)} style={{ marginRight: "10px" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(space.id)} style={{ backgroundColor: "red", color: "white" }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageParkingPage;
