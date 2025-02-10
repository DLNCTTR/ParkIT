/* global google */

import React, { useEffect, useState } from "react";

const MapPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const API_BASE_URL = "https://localhost:7155/api/HomePage"; 

    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/parking-spaces`); 
                if (!response.ok) throw new Error("Failed to fetch parking spaces");

                const data = await response.json();
                setParkingSpaces(data);
            } catch (error) {
                console.error("Error fetching parking spaces:", error);
            }
        };

        fetchParkingSpaces();

        // ✅ Auto-refresh every 30 seconds
        const interval = setInterval(fetchParkingSpaces, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (window.google) {
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 12,
                center: { lat: 40.7128, lng: -74.0060 },
            });

            parkingSpaces.forEach((space) => {
                new google.maps.Marker({
                    position: { lat: space.latitude, lng: space.longitude },
                    map,
                    title: space.location,
                });
            });
        }
    }, [parkingSpaces]);

    return (
        <div>
            <h1>Parking Map</h1>
            <div id="map" style={{ width: "100%", height: "500px" }}></div>
        </div>
    );
};

export default MapPage;
