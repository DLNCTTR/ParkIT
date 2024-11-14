// src/ParkingSpots.js
import React, { useState, useEffect } from 'react';
import api from './api'; // Import the Axios instance to communicate with the backend

function ParkingSpots() {
    const [spots, setSpots] = useState([]); // State to store the list of parking spots
    const [formData, setFormData] = useState({
        location: '',
        price: '', // Using an empty string initially to ensure controlled input
        type: '',
        capacity: '',
        availability: false,
        owner: '',
        description: '' // Field for description
    });
    const [editingId, setEditingId] = useState(null); // Track the ID of the spot being edited

    // Fetch parking spots on component mount
    useEffect(() => {
        fetchSpots(); // Call fetchSpots to load the list initially
    }, []);

    // Function to fetch parking spots from the backend
    const fetchSpots = () => {
        api.get('/parking')
            .then(response => {
                setSpots(response.data); // Store the list of spots in state
            })
            .catch(error => console.error('Error fetching spots:', error));
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Function to handle form submission for creating or updating a parking spot
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Convert price to a number before sending to the backend
        const submissionData = { ...formData, price: parseFloat(formData.price) || 0 };

        if (editingId) {
            // Update existing parking spot
            api.put(`/parking/${editingId}`, submissionData)
                .then(() => {
                    fetchSpots(); // Refresh the list after updating
                    resetForm(); // Clear the form after update
                })
                .catch(error => console.error('Error updating spot:', error));
        } else {
            // Create a new parking spot
            api.post('/parking', submissionData)
                .then(() => {
                    fetchSpots(); // Refresh the list after adding a new spot
                    resetForm(); // Clear the form after adding
                })
                .catch(error => console.error('Error adding spot:', error));
        }
    };

    // Reset form data after submitting or cancelling an edit
    const resetForm = () => {
        setFormData({
            location: '',
            price: '', // Reset to empty string
            type: '',
            capacity: '',
            availability: false,
            owner: '',
            description: '' // Reset description as well
        });
        setEditingId(null);
    };

    // Set form data for editing an existing parking spot
    const handleEdit = (spot) => {
        setFormData({
            location: spot.location,
            price: spot.price.toString(), // Convert price to string to display correctly in input
            type: spot.type,
            capacity: spot.capacity.toString(),
            availability: spot.availability,
            owner: spot.owner,
            description: spot.description // Load description for editing
        });
        setEditingId(spot.id); // Set the ID of the spot being edited
    };

    // Confirm and delete a parking spot by its id
    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this parking spot?");
        if (confirmDelete) {
            api.delete(`/parking/${id}`)
                .then(() => fetchSpots()) // Refresh the list after deletion
                .catch(error => console.error('Error deleting spot:', error));
        }
    };

    return (
        <div>
            <h2>Manage Parking Spots</h2>

            {/* Form for adding or updating parking spots */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Location:
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Price per Hour (€):
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01" // Allow for decimal values
                            min="0"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Type:
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Capacity:
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Availability:
                        <input
                            type="checkbox"
                            name="availability"
                            checked={formData.availability}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Owner:
                        <input
                            type="text"
                            name="owner"
                            value={formData.owner}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description:
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        />
                    </label>
                </div>
                <button type="submit">{editingId ? 'Update' : 'Add'} Parking Spot</button>
                {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>

            {/* Display list of parking spots */}
            <ul>
                {spots.map(spot => (
                    <li key={spot.id}>
                        <strong>Location:</strong> {spot.location} |
                        <strong> Price per Hour:</strong> €{spot.price} |
                        <strong> Type:</strong> {spot.type} |
                        <strong> Capacity:</strong> {spot.capacity} |
                        <strong> Available:</strong> {spot.availability ? 'Yes' : 'No'} |
                        <strong> Owner:</strong> {spot.owner} |
                        <strong> Description:</strong> {spot.description}
                        <button onClick={() => handleEdit(spot)}>Edit</button>
                        <button onClick={() => handleDelete(spot.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ParkingSpots;
