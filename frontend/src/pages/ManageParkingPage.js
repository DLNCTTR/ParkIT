import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageParkingPage = () => {
    // State for parking spaces
    const [parkingSpaces, setParkingSpaces] = useState([]);

    // State for the form (used for adding or editing parking spaces)
    const [form, setForm] = useState({
        id: null,
        location: "",
        availability: true,
        pricePerHour: "",
        owner: "",
        capacity: "",
        type: "",
        description: "",
    });

    // Track whether the user is editing or adding
    const [isEditing, setIsEditing] = useState(false);

    // Fetch parking spaces on component mount
    useEffect(() => {
        fetchParkingSpaces();
    }, []);

    // Fetch all parking spaces from the backend
    const fetchParkingSpaces = async () => {
        try {
            const response = await axios.get("https://localhost:7155/api/parking/");
            setParkingSpaces(response.data);
        } catch (error) {
            console.error("Error fetching parking spaces:", error);
        }
    };

    // Handle form submission for adding or updating a parking space
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            pricePerHour: parseFloat(form.pricePerHour), // Ensure pricePerHour is a number
            capacity: parseInt(form.capacity, 10),      // Ensure capacity is an integer
            availability: form.availability === true || form.availability === "true", // Ensure availability is boolean
        };

        // Basic validation
        if (!payload.location || !payload.pricePerHour || !payload.capacity || !payload.type) {
            alert("Please fill in all required fields!");
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`https://localhost:7155/api/parking/${payload.id}`, payload);
            } else {
                await axios.post("https://localhost:7155/api/parking/", payload);
            }

            // Reset the form and refresh the parking spaces
            setForm({ id: null, location: "", availability: true, pricePerHour: "", owner: "", capacity: "", type: "", description: "" });
            setIsEditing(false);
            fetchParkingSpaces();
        } catch (error) {
            console.error("Error saving parking spot:", error.response?.data || error);
            alert("Failed to save the parking spot. Please check the console for details.");
        }
    };

    // Handle editing a parking space
    const handleEdit = (space) => {
        setForm(space);
        setIsEditing(true);
    };

    // Handle deleting a parking space
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this parking spot?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`https://localhost:7155/api/parking/${id}`);
            fetchParkingSpaces();
        } catch (error) {
            console.error("Error deleting parking spot:", error);
            alert("Failed to delete the parking spot. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Manage Parking Spaces</h1>

            {/* Form for adding or editing parking spaces */}
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

            {/* Display existing parking spaces */}
            <h2>Existing Parking Spaces</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {parkingSpaces.map((space) => (
                    <li
                        key={space.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            padding: "15px",
                            marginBottom: "10px",
                        }}
                    >
                        <p>
                            <strong>Location:</strong> {space.location}
                        </p>
                        <p>
                            <strong>Availability:</strong> {space.availability ? "Yes" : "No"}
                        </p>
                        <p>
                            <strong>Price per Hour:</strong> €{space.pricePerHour}
                        </p>
                        <p>
                            <strong>Owner:</strong> {space.owner}
                        </p>
                        <p>
                            <strong>Capacity:</strong> {space.capacity}
                        </p>
                        <p>
                            <strong>Type:</strong> {space.type}
                        </p>
                        <p>
                            <strong>Description:</strong> {space.description}
                        </p>
                        <button onClick={() => handleEdit(space)} style={{ marginRight: "10px" }}>
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(space.id)}
                            style={{ backgroundColor: "red", color: "white" }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageParkingPage;
