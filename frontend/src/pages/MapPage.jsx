import React, { useEffect } from "react";

const MapPage = () => {
    useEffect(() => {
        const initMap = () => {
            // Create a map centered at a default location (latitude, longitude)
            new window.google.maps.Map(document.getElementById("map"), {
                center: { lat: 51.8985143, lng: -8.4756035 }, // Cork, Ireland
                zoom: 13,
            });
        };

        // Load Google Maps script dynamically
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);

        // Cleanup the script when the component unmounts
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div>
            <h1>Map Page</h1>
            {/* The map will render here */}
            <div id="map" style={{ height: "500px", width: "100%" }}></div>
        </div>
    );
};

export default MapPage;
