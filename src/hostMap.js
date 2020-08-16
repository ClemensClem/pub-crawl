import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";

import { addMarkerPosition } from "./actions";
import Search from "./hostMapSearch";
import Locate from "./hostMapLocate";
const secrets = require("../secrets");

//this is for styling the map
import mapStyles from "./mapStyles";

//Maps settings
const libraries = ["places"];
const mapContainerStyle = {
    width: "69vw",
    height: "45vh",
};
//map styling
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: mapStyles,
};
/* const startCenter = {
    lat: 52.52000659999999,
    lng: 13.404954,
}; */

export default function HostMap() {
    const dispatch = useDispatch();

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: secrets.GOOGLE_API_KEY,
        libraries,
    });

    //storing nearbyPlaces search results from Redux store
    const nearbyPlaces = useSelector(
        (state) => state.nearbyPlaces && state.nearbyPlaces.bars
    );

    //storing selected Bars from Redux store
    const selectedBars = useSelector(
        (state) => state.selectedBars && state.selectedBars
    );

    //storing marker position from Redux store
    const markerPosition = useSelector(
        (state) => state.markerPosition && state.markerPosition
    );

    //this stores the bar on which was clicked on the map
    const [selectedBar, setSelectedBar] = useState(null);

    //retaining a ref to the map instance
    const mapRef = useRef;
    //we will be passed to that callback function when map loads, this callback attaches the map to the ref when it loads --> map will be received from <Google-Map> component
    //this will cause to use "map" anywhere in the code without any rerendering!
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    //panTo function centers map to selected value from search box
    const panTo = useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat: lat, lng: lng });
        mapRef.current.setZoom(13);
    }, []);

    //handling of asynchronous Google Maps API --> this should appear after all the Hooks up here otherwise a huge ERROR will appear
    if (loadError) {
        return "ERROR loading Maps";
    }
    if (!isLoaded) {
        return "Loading Maps";
    }

    //stores the coordinates of clicked position on map in Redux state store
    const clickOnMap = async (e) => {
        console.log("click event on map: ", e);
        const markerPosition = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        };
        try {
            await dispatch(addMarkerPosition(markerPosition));
        } catch (err) {
            console.log("ERROR in clickHander --> hostMap.js: ", err);
        }
    };

    return (
        <div className="map">
            <Search panTo={panTo} />
            <Locate panTo={panTo} />
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={13}
                center={
                    markerPosition && {
                        lat: markerPosition.lat,
                        lng: markerPosition.lng,
                    }
                }
                // center={startCenter}
                options={options}
                onClick={(e) => clickOnMap(e)}
                onLoad={onMapLoad}
            >
                {/* renders the nearby places search results */}
                {nearbyPlaces &&
                    nearbyPlaces.map((bar) => (
                        <Marker
                            key={bar.place_id}
                            position={{
                                lat: bar.geometry.location.lat,
                                lng: bar.geometry.location.lng,
                            }}
                            onClick={() => setSelectedBar(bar)}
                            icon={{
                                url: "./resources/media/cocktail.png",
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                        />
                    ))}

                {/* renders the selected bars*/}
                {selectedBars &&
                    selectedBars.map((bar) => (
                        <Marker
                            key={bar.place_id}
                            position={{
                                lat: bar.geometry.location.lat,
                                lng: bar.geometry.location.lng,
                            }}
                            onClick={() => setSelectedBar(bar)}
                            icon={{
                                url: "./resources/media/cocktail-blue.png",
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                        />
                    ))}

                {selectedBar && (
                    <InfoWindow
                        position={{
                            lat: selectedBar.geometry.location.lat,
                            lng: selectedBar.geometry.location.lng,
                        }}
                        onCloseClick={() => setSelectedBar(null)}
                    >
                        <div className="infoWindow" id="selectedBar.place_id">
                            <h3>{selectedBar.name}</h3>
                            {/* {selectedBar.photos[0].photo_reference && (
                            <img
                                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedBar.photos[0].photo_reference}&key=${secrets.GOOGLE_API_KEY}`}
                            />
                        )} */}
                            {selectedBar.opening_hours && <h4>Now Open</h4>}
                            <h4>Price Level {selectedBar.price_level}</h4>
                            <h4>
                                Rating {selectedBar.rating} from{" "}
                                {selectedBar.user_ratings_total} ratings
                            </h4>
                            <p>{selectedBar.vicinity}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
