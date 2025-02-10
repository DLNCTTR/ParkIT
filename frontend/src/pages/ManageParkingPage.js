import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageParkingPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        location: "",
        availability: true,
        pricePerHour: "",
        capacity: "",
        type: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const API_BASE_URL = "https://localhost:7155/api";

    useEffect(() => {
        fetchUserRole();
    }, []);

    // ✅ Fetch user role to determine access level
    const fetchUserRole = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/auth/user-role`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUserRole(response.data.role);
            fetchParkingSpaces(response.data.role);
        } catch (error) {
            console.error("❌ Error fetching user role:", error.response?.data || error);
            setError("Failed to determine user role. Please log in.");
        }
    };

    const fetchParkingSpaces = async (role) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("❌ User is not authenticated. Please log in.");
            }

            const endpoint = role === "Admin" ? `${API_BASE_URL}/HomePage/parking-spaces` : `${API_BASE_URL}/parking`;

            const response = await axios.get(endpoint, {
                headers: {
                    "Authorization": `Bearer ${token}`, // ✅ Include the token
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 401) {
                throw new Error("❌ Unauthorized - Token may be expired or invalid.");
            }

            setParkingSpaces(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("❌ Error fetching parking spaces:", error.response?.data || error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };



    // ✅ Handle form submission (Add / Edit)
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            location: form.location,
            pricePerHour: parseFloat(form.pricePerHour || "0"),
            capacity: parseInt(form.capacity || "0", 10),
            availability: form.availability === true || form.availability === "true",
            type: form.type,
            description: form.description || null,
        };

        const token = localStorage.getItem("token");

        try {
            if (isEditing && editingId) {
                await axios.put(`${API_BASE_URL}/parking/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Parking spot updated successfully.");
            } else {
                await axios.post(`${API_BASE_URL}/parking`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Parking spot added successfully.");
            }

            resetForm();
            fetchParkingSpaces(userRole);
        } catch (error) {
            console.error("❌ Error saving parking spot:", error.response?.data || error);
            alert(`Failed to save the parking spot: ${error.response?.data?.title || "Unknown error"}`);
        }
    };

    // ✅ Handle Edit Click
    const handleEdit = (space) => {
        setForm({
            location: space.location,
            availability: space.availability,
            pricePerHour: space.pricePerHour,
            capacity: space.capacity,
            type: space.type,
            description: space.description,
        });
        setIsEditing(true);
        setEditingId(space.id);
    };

    // ✅ Handle Delete Click
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this parking spot?")) return;

        const token = localStorage.getItem("token");

        try {
            await axios.delete(`${API_BASE_URL}/parking/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Parking spot deleted successfully.");
            fetchParkingSpaces(userRole);
        } catch (error) {
            console.error("❌ Error deleting parking spot:", error.response?.data || error);
            alert("Failed to delete the parking spot. Please try again.");
        }
    };

    // ✅ Reset form fields
    const resetForm = () => {
        setForm({
            location: "",
            availability: true,
            pricePerHour: "",
            capacity: "",
            type: "",
            description: "",
        });
        setIsEditing(false);
        setEditingId(null);
    };

    if (loading) return <div>Loading parking spaces...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>{userRole === "Admin" ? "All Parking Spaces" : "Manage Your Parking Spaces"}</h1>

            <form onSubmit={handleFormSubmit} style={{ marginBottom: "20px" }}>
                <h2>{isEditing ? "Edit Parking Spot" : "Add New Parking Spot"}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input type="text" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" required />
                    <select name="availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value === "true" })}>
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                    </select>
                    <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} placeholder="Price per Hour (€)" required />
                    <input type="number" name="capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" required />
                    <input type="text" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Type" required />
                    <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows="3" />
                </div>
                <button type="submit" style={{ marginTop: "10px" }}>
                    {isEditing ? "Save Changes" : "Add Parking Spot"}
                </button>
                {isEditing && <button onClick={resetForm} style={{ marginLeft: "10px", backgroundColor: "gray" }}>Cancel</button>}
            </form>

            <h2>Existing Parking Spaces</h2>
            {parkingSpaces.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {parkingSpaces.map((space) => (
                        <li key={space.id} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px" }}>
                            <p><strong>Location:</strong> {space.location}</p>
                            <p><strong>Availability:</strong> {space.availability ? "Yes" : "No"}</p>
                            <p><strong>Price per Hour:</strong> €{space.pricePerHour}</p>
                            <button onClick={() => handleEdit(space)}>Edit</button>
                            <button onClick={() => handleDelete(space.id)} style={{ backgroundColor: "red", color: "white" }}>Delete</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No parking spaces available.</p>
            )}
        </div>
    );
};

export default ManageParkingPage;
