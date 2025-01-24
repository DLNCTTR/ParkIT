import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ParkingDetailsPage = () => {
    const { id } = useParams();
    const [parkingSpot, setParkingSpot] = useState(null);

    useEffect(() => {
        const fetchParkingSpot = async () => {
            try {
                const response = await fetch(`/api/parking/${id}`);
                const data = await response.json();
                setParkingSpot(data);
            } catch (error) {
                console.error("Error fetching parking spot details:", error);
            }
        };

        fetchParkingSpot();
    }, [id]);

    useEffect(() => {
        if (parkingSpot && window.google) {
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: { lat: parkingSpot.latitude, lng: parkingSpot.longitude },
            });

            new google.maps.Marker({
                position: { lat: parkingSpot.latitude, lng: parkingSpot.longitude },
                map,
                title: parkingSpot.location,
            });
        }
    }, [parkingSpot]);

    if (!parkingSpot) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{parkingSpot.location}</h1>
            <p>Price per Hour: ${parkingSpot.pricePerHour}</p>
            <p>Type: {parkingSpot.type}</p>
            <p>Capacity: {parkingSpot.capacity}</p>
            <p>Available: {parkingSpot.available ? "Yes" : "No"}</p>
            <div id="map" style={{ width: "100%", height: "500px" }}></div>
        </div>
    );
};

export default ParkingDetailsPage;
