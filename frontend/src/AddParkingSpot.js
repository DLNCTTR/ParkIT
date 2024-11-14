// src/AddParkingSpot.js
import React, { useState } from 'react';
import api from './api';

function AddParkingSpot({ onSpotAdded }) {
    // Initialize form data state
    const [formData, setFormData] = useState({
        location: '',
        availability: false,
        price: 0,
        owner: '',
        capacity: 0,
        status: '',
        type: ''
    });

    // Update form data as user types
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Submit form data to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to add the parking spot
            const response = await api.post('/parking', formData);
            onSpotAdded(response.data); // Call the callback to update the list
            setFormData({
                location: '',
                availability: false,
                price: 0,
                owner: '',
                capacity: 0,
                status: '',
                type: ''
            });
        } catch (error) {
            console.error('Error adding parking spot:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Parking Spot</h2>
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
                    Price:
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
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
                    Capacity:
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Status:
                    <input
                        type="text"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
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
                    />
                </label>
            </div>
            <button type="submit">Add Parking Spot</button>
        </form>
    );
}

export default AddParkingSpot;
