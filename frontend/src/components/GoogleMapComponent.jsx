import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
    width: "100%",
    height: "400px",
};

const center = {
    lat: 37.7749, // Replace with your desired latitude
    lng: -122.4194, // Replace with your desired longitude
};

const GoogleMapComponent = () => {
    return (
        <LoadScript googleMapsApiKey="AIzaSyBG8lby0DadrAs7NAy7izmSA419xCvNq0M">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={10}
            >
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    );
};

export default GoogleMapComponent;
