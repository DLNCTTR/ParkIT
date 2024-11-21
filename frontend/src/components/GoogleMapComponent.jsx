// src/components/GoogleMapComponent.jsx
import React, { useEffect } from "react";
import "./GoogleMapComponent.css";

const GoogleMapComponent = () => {
    useEffect(() => {
        const init = async () => {
            await customElements.whenDefined("gmp-map");

            const map = document.querySelector("gmp-map");
            const marker = document.querySelector("gmp-advanced-marker");
            const placePicker = document.querySelector("gmpx-place-picker");
            const infowindow = new google.maps.InfoWindow();

            // Configure map options
            map.innerMap.setOptions({
                mapTypeControl: false,
            });

            // Handle place picker changes
            placePicker.addEventListener("gmpx-placechange", () => {
                const place = placePicker.value;

                if (!place.location) {
                    alert(`No details available for input: '${place.name}'`);
                    infowindow.close();
                    marker.position = null;
                    return;
                }

                if (place.viewport) {
                    map.innerMap.fitBounds(place.viewport);
                } else {
                    map.center = place.location;
                    map.zoom = 17;
                }

                marker.position = place.location;
                infowindow.setContent(
                    `<strong>${place.displayName}</strong><br>
                     <span>${place.formattedAddress}</span>`
                );
                infowindow.open(map.innerMap, marker);
            });
        };

        document.addEventListener("DOMContentLoaded", init);

        return () => {
            document.removeEventListener("DOMContentLoaded", init);
        };
    }, []);

    return (
        <div>
            <gmpx-api-loader
                key={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                solution-channel="GMP_GE_mapsandplacesautocomplete_v1"
            ></gmpx-api-loader>

            <gmp-map
                center="40.749933,-73.98633"
                zoom="13"
                map-id="DEMO_MAP_ID"
                style={{ height: "500px", width: "100%" }}
            >
                <div slot="control-block-start-inline-start" className="place-picker-container">
                    <gmpx-place-picker placeholder="Enter an address"></gmpx-place-picker>
                </div>
                <gmp-advanced-marker></gmp-advanced-marker>
            </gmp-map>
        </div>
    );
};

export default GoogleMapComponent;
