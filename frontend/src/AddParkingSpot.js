// src/AddParkingSpot.js (Updated)
import React, { useState, useEffect } from 'react';

function AddParkingSpot({ onSpotAdded }) {
    const [formData, setFormData] = useState({
        location: '',
        availability: false,
        price: 0,
        owner: '',
        capacity: 0,
        status: '',
        type: '',
        latitude: 0,
        longitude: 0,
    });

    const API_BASE_URL = "https://localhost:7155/api/HomePage"; 

    useEffect(() => {
        if (window.google) {
            const map = new google.maps.Map(document.getElementById("map-picker"), {
                zoom: 12,
                center: { lat: 40.7128, lng: -74.0060 },
            });

            const marker = new google.maps.Marker({
                position: { lat: 40.7128, lng: -74.0060 },
                map: map,
                draggable: true,
            });

            marker.addListener("dragend", function () {
                const position = marker.getPosition();
                setFormData(prevState => ({
                    ...prevState,
                    latitude: position.lat(),
                    longitude: position.lng(),
                }));
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/parking-space`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to add parking spot");

            const data = await response.json();
            onSpotAdded(data);
            setFormData({
                location: '',
                availability: false,
                price: 0,
                owner: '',
                capacity: 0,
                status: '',
                type: '',
                latitude: 0,
                longitude: 0,
            });
        } catch (error) {
            console.error('Error adding parking spot:', error);
        }
    };

    return (
        <div>
            <h2>Add Parking Spot</h2>
            <form onSubmit={handleSubmit}>
                <label>Location:</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />

                <label>Price:</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />

                <label>Capacity:</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />

                <label>Availability:</label>
                <input type="checkbox" name="availability" checked={formData.availability} onChange={handleChange} />

                <h3>Select Location on Map:</h3>
                <div id="map-picker" style={{ width: "100%", height: "400px" }}></div>

                <button type="submit">Add Parking Spot</button>
            </form>
        </div>
    );
}

export default AddParkingSpot;
