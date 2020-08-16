import React, { useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import HostMap from "./hostMap";
import RenderRoute from "./renderRoute";
import {
    addMarkerPosition,
    selectBarFromList,
    selectBarFromSelection,
} from "./actions";

export default function HostEvent() {
    const dispatch = useDispatch();

    const [currentLocation, setCurrentLocation] = useState({});

    //storing nearbyPlaces search results from Redux store
    const nearbyPlaces = useSelector(
        (state) => state.nearbyPlaces && state.nearbyPlaces
    );

    const selectedBars = useSelector(
        (state) => state.selectedBars && state.selectedBars
    );

    //storing marker position from Redux store
    const markerPosition = useSelector(
        (state) => state.markerPosition && state.markerPosition
    );

    //getting event-id
    const eventId = useSelector((state) => state.eventId && state.eventId);
    console.log("event id: ", eventId);

    //loads the actual position of user
    useEffect(() => {
        (async () => {
            try {
                if (navigator && navigator.geolocation) {
                    await navigator.geolocation.getCurrentPosition((pos) => {
                        const coords = pos.coords;
                        setCurrentLocation({
                            lat: coords.latitude,
                            lng: coords.longitude,
                        });
                    });
                } else {
                    //location Berlin center
                    setCurrentLocation({
                        lat: 52.520008,
                        lng: 13.404954,
                    });
                }
            } catch (err) {
                if (err.code == err.PERMISSION_DENIED) {
                    console.log("ERROR in finding current location: ", err);
                    //location Berlin center
                    setCurrentLocation({
                        lat: 52.520008,
                        lng: 13.404954,
                    });
                } else {
                    console.log(
                        "ERROR in hostEvent.js ...getCurrentPosition: ",
                        err
                    );
                }
            }
        })();
    }, []);

    //calls for nearby bars:
    useEffect(() => {
        if (currentLocation.lat && currentLocation.lng) {
            //pushing current location to redux state store
            (async () => {
                dispatch(addMarkerPosition(currentLocation));
            })();
            //receiving nearby places
            (async () => {
                socket.emit("Get nearby places", currentLocation);
            })();
        }
    }, [currentLocation]);

    //bar is moved to the selection list
    const clickOnBarInList = async (bar) => {
        console.log("clickOnBarInList: ", bar);
        try {
            dispatch(selectBarFromList(bar));
        } catch (err) {
            console.log("ERROR in hostEvent.js --> clickOnBarInList: ", err);
        }
    };

    //bar is moved to the bar-list
    const clickOnBarInSelection = async (bar) => {
        console.log("clickOnBarInSelection: ", bar);
        try {
            dispatch(selectBarFromSelection(bar));
        } catch (err) {
            console.log(
                "ERROR in hostEvent.js --> clickOnBarInSelection: ",
                err
            );
        }
    };

    return (
        <div className="hostEvent">
            <div className="search-container">
                <div className="search-container-sub-container1">
                    <div className="search-results">
                        {nearbyPlaces &&
                            nearbyPlaces.bars.map((bar) => (
                                <div
                                    className="result-box"
                                    key={"result" + bar.place_id}
                                    id={bar.place_id}
                                    onClick={() => {
                                        clickOnBarInList(bar);
                                    }}
                                >
                                    <h3>{bar.name}</h3>
                                    {/* {bar.photos[0].photo_reference && (
                            <img
                                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${bar.photos[0].photo_reference}&key=${secrets.GOOGLE_API_KEY}`}
                            />
                        )} */}
                                    {bar.opening_hours && <h4>Now Open</h4>}
                                    <h4>Price Level {bar.price_level}</h4>
                                    <h4>
                                        Rating {bar.rating} from{" "}
                                        {bar.user_ratings_total} ratings
                                    </h4>
                                    <p>{bar.vicinity}</p>
                                </div>
                            ))}
                    </div>
                    <HostMap />
                </div>

                <div className="search-container-sub-container2">
                    <div className="selected-results">
                        {selectedBars &&
                            selectedBars.map((bar) => (
                                <div
                                    className="result-box"
                                    key={"selected" + bar.place_id}
                                    id={bar.place_id}
                                    onClick={() => {
                                        clickOnBarInSelection(bar);
                                    }}
                                >
                                    <h3>{bar.name}</h3>
                                    {/* {bar.photos[0].photo_reference && (
                            <img
                                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${bar.photos[0].photo_reference}&key=${secrets.GOOGLE_API_KEY}`}
                            />
                        )} */}
                                    {bar.opening_hours && <h4>Now Open</h4>}
                                    <h4>Price Level {bar.price_level}</h4>
                                    <h4>
                                        Rating {bar.rating} from{" "}
                                        {bar.user_ratings_total} ratings
                                    </h4>
                                    <p>{bar.vicinity}</p>
                                </div>
                            ))}
                    </div>
                    <RenderRoute />
                </div>
            </div>
            <Link to={`/event-details/${eventId}`}>
                <img
                    className="button-to-event-description"
                    src="./resources/media/shaker.png"
                />
            </Link>
        </div>
    );
}
