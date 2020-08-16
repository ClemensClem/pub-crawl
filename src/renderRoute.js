import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    GoogleMap,
    DirectionsRenderer,
    useLoadScript,
    DirectionsService,
} from "@react-google-maps/api";
import axios from "./axios";

const secrets = require("../secrets");
import { addEventId } from "./actions";

import mapStyles from "./mapStyles";

//default map settings
const libraries = ["places"];
const mapContainerStyle = {
    width: "69vw",
    height: "45vh",
};
const options = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: mapStyles,
};

//function starts here:
export default function RenderRoute() {
    const dispatch = useDispatch();

    let origin = null;
    let destination = null;
    let waypoints = [];

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: secrets.GOOGLE_API_KEY,
        libraries,
    });

    const [response, setResponse] = useState(null);

    //this state checks which component is allowed to rerender
    const [allowToRerender, setAllowToRerender] = useState(true);

    //on component mount the eventId is set
    // const [eventId, setEventId] = useState(null);
    const eventId = useSelector((state) => state.eventId && state.eventId);

    //markerPosition contains the coordinates of the point on map around which nearby bars are searched
    const markerPosition = useSelector(
        (state) => state.markerPosition && state.markerPosition
    );

    const selectedBars = useSelector(
        (state) => state.selectedBars && state.selectedBars
    );

    //defining navigation variables
    //if there are results in the state store
    if (selectedBars && selectedBars[0]) {
        for (let i = 0; i < selectedBars.length; i++) {
            if (i == 0) {
                origin = { placeId: selectedBars[i].place_id };
            } else if (i == selectedBars.length - 1) {
                destination = { placeId: selectedBars[i].place_id };
            } else {
                waypoints.push({
                    location: {
                        placeId: selectedBars[i].place_id,
                    },
                });
            }
        }
    }

    //setting a ref to the map instance so that map could be reused in other components
    const mapRef = useRef;
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const directionsCallback = (res) => {
        console.log("directionsCallback response: ", res);
        if (res !== null) {
            if (res.status === "OK") {
                setResponse(res);
                setAllowToRerender(false);
            } else {
                console.log("response: ", res);
            }
        }
    };

    useEffect(() => {
        (async () => {
            try {
                //transforming data for storing it in db
                const mapData = {
                    eventId,
                    response,
                    selectedBars,
                    markerPosition,
                };
                // const mapDataJsonString = JSON.stringify(mapData);
                // const mapDataObj = { mapDataJsonString };
                // const selectedBarsObj = { selectedBars };
                // const selectedBarsJsonString = JSON.stringify(selectedBarsObj);
                // console.log("parse response: ", JSON.parse(responseJsonString));
                // console.log(
                //     "parse selectedBars: ",
                //     JSON.parse(selectedBarsJsonString)
                // );
                // const mapData = {
                //     responseJsonString,
                //     selectedBarsJsonString,
                //     markerPosition,
                // };
                const { data } = await axios.post(
                    `/update-event-data`,
                    mapData
                );
            } catch (err) {
                console.log(
                    "ERROR in /store-event-data --> renderRoute.js: ",
                    err
                );
            }
        })();
    }, [response]);

    //as soon as a bar is added or deselcted from the selected bars list the permission for rerendering is given
    useEffect(() => {
        setAllowToRerender(true);
    }, [selectedBars]);

    //creates the db-entry and event-id for the event on-mount
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.post("/create-event", {});
                if (data.success) {
                    // setEventId(data.eventId);
                    dispatch(addEventId(data.eventId));
                }
            } catch (err) {
                console.log("ERROR in /create-event --> renderRoute.js: ", err);
            }
        })();
    }, []);

    //handling of asynchronous Google Maps API --> this should appear after all the Hooks up here otherwise a huge ERROR will appear
    if (loadError) {
        return "ERROR loading Maps";
    }
    if (!isLoaded) {
        return "Loading Maps";
    }

    return (
        <div className="map-route">
            <div className="render-route_map-container">
                <GoogleMap
                    // // required
                    id="render-route_GoogleMap"
                    mapContainerStyle={mapContainerStyle}
                    zoom={10}
                    center={
                        markerPosition && {
                            lat: markerPosition.lat,
                            lng: markerPosition.lng,
                        }
                    }
                    options={options}
                    onLoad={onMapLoad}
                >
                    {origin && destination && allowToRerender && (
                        <DirectionsService
                            options={{
                                origin: origin,
                                destination: destination,
                                waypoints: waypoints,
                                optimizeWaypoints: true,
                                travelMode: "WALKING",
                            }}
                            // required
                            callback={(res) => directionsCallback(res)}
                            // optional
                            onLoad={(directionsService) => {
                                console.log(
                                    "DirectionsService onLoad directionsService: ",
                                    directionsService
                                );
                            }}
                            // optional
                            onUnmount={(directionsService) => {
                                console.log(
                                    "DirectionsService onUnmount directionsService: ",
                                    directionsService
                                );
                            }}
                        />
                    )}

                    {origin && destination && response && (
                        <DirectionsRenderer
                            options={{
                                directions: response,
                            }}
                            // optional
                            onLoad={(directionsRenderer) => {
                                console.log(
                                    "DirectionsRenderer onLoad directionsRenderer: ",
                                    directionsRenderer
                                );
                            }}
                            // optional
                            onUnmount={(directionsRenderer) => {
                                console.log(
                                    "DirectionsRenderer onUnmount directionsRenderer: ",
                                    directionsRenderer
                                );
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
        </div>
    );
}
