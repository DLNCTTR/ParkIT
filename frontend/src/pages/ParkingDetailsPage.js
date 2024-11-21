import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ParkingDetailsPage = () => {
    const { id } = useParams(); // Get parking space ID from URL
    const [parkingSpace, setParkingSpace] = useState(null); // State for parking space details

    // Fetch parking space details from the API
    useEffect(() => {
        axios
            .get(`/api/parking/parking-space/${id}`)
            .then((response) => setParkingSpace(response.data))
            .catch((error) => console.error("Error fetching parking space details:", error));
    }, [id]);

    if (!parkingSpace) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{parkingSpace.location}</h1>
            <p>{parkingSpace.description}</p>
            <p>{parkingSpace.isAvailable ? "Available" : "Not Available"}</p>
        </div>
    );
};

export default ParkingDetailsPage;
