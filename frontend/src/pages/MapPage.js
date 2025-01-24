import React, { useEffect, useState } from "react";

const MapPage = () => {
    const [parkingSpaces, setParkingSpaces] = useState([]);

    useEffect(() => {
        const fetchParkingSpaces = async () => {
            try {
                const response = await fetch("/api/parking");
                const data = await response.json();
                setParkingSpaces(data);
            } catch (error) {
                console.error("Error fetching parking spaces:", error);
            }
        };

        fetchParkingSpaces();
    }, []);

    useEffect(() => {
        if (window.google) {
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 12,
                center: { lat: 40.7128, lng: -74.0060 }, // Example: Default to New York City
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
