import React from "react";
import { useDispatch } from "react-redux";

import { addMarkerPosition } from "./actions";

export default function Locate({ panTo }) {
    const dispatch = useDispatch();

    return (
        <img
            src="./resources/media/compass.png"
            alt="Locate me!"
            className="locateMe"
            onClick={() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log("position: ", position);
                        const markerPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        dispatch(addMarkerPosition(markerPosition));
                        panTo({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    //this is the callback of the function in error-case
                    () => null
                );
            }}
        />
    );
}
