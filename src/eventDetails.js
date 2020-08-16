import React, { useRef, useState, useCallback, useEffect } from "react";
import {
    GoogleMap,
    DirectionsRenderer,
    useLoadScript,
    Marker,
} from "@react-google-maps/api";
import { Link } from "react-router-dom";

import axios from "./axios";
import { addMarkerToMap } from "./actions";

import mapStyles from "./mapStyles";

const secrets = require("../secrets");

//default map settings
const libraries = ["places"];
const mapContainerStyle = {
    width: "69vw",
    height: "50vh",
};
//map styling
const options = {
    styles: mapStyles,
};

export default function EventDetails({ match }) {
    const eventId = match.params.id;
    let markedBars = [];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // var title = "";
    // var description = "";
    // var date = "";
    // var time = "";

    //for reveiving and rendering the event content on page load
    const [response, setResponse] = useState({});
    const [selectedBars, setSelectedBars] = useState([]);
    const [markerPosition, setMarkerPosition] = useState({});

    // const [titleOnLoad, setTitleOnLoad] = useState("");
    // const [descriptionOnLoad, setDescriptionOnLoad] = useState("");
    // const [startDateOnLoad, setStartDateOnLoad] = useState("");
    // const [startTimeOnLoad, setStartTimeOnLoad] = useState("");

    const [participants, setParticipants] = useState([]);

    //for updating the event pic
    const [eventPic, setEventPic] = useState("");

    //for tracking if user is host
    const [userIsHost, setUserIsHost] = useState();

    //for tracking if user joined the event already
    const [userIsParticipant, setUserIsParticipant] = useState();

    //for setting rerender allowance for directions renderer
    const [allowToRerender, setAllowToRerender] = useState(true);

    //this is for triggering rerendering when a bar in the selection is clicked so that marker can be indicated on map
    const [showMarkedBars, setShowMarkedBars] = useState(true);

    //passes Google API key to components
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: secrets.GOOGLE_API_KEY,
        libraries,
    });

    //states definieren
    useEffect(() => {
        (async () => {
            try {
                //checking if user joined event already
                const participation = await axios.get(
                    `/check-participation/${eventId}.json`
                );
                if (participation.data.success) {
                    setUserIsParticipant(true);
                } else {
                    setUserIsParticipant(false);
                }
                console.log("check participation: ", participation);

                //data to display is received
                const { data } = await axios.get(
                    `/get-event-data/${eventId}.json`
                );

                console.log("data: ", data);

                //map data
                const mapDataObj = JSON.parse(data.rows[0].map_data);
                setResponse(mapDataObj.response);
                setSelectedBars(mapDataObj.selectedBars);
                setMarkerPosition(mapDataObj.markerPosition);

                console.log("response: ", mapDataObj.response);
                console.log("selectedBars: ", mapDataObj.selectedBars);
                console.log("markerPosition: ", mapDataObj.markerPosition);

                //other event data
                setTitle(data.rows[0].title);
                setEventPic(data.rows[0].event_picture_url);
                setDescription(data.rows[0].description);
                setDate(data.rows[0].start_date);
                setTime(data.rows[0].start_time);

                //check if user is host
                setUserIsHost(data.userIsHost);

                //receiving participants
                const participantsObj = await axios.get(
                    `/get-participants/${eventId}.json`
                );
                console.log(
                    "data.participantsObj.rows: ",
                    participantsObj.data
                );
                setParticipants(participantsObj.data);
            } catch (err) {
                console.log(
                    `ERROR in GET "/get-event-data/:${eventId}.json" --> eventDetails.js: `,
                    err
                );
            }
        })();
    }, []);

    //this functions sets the marker on the map --> it is not working properly yet
    const markBarOnMap = (bar) => {
        console.log("I am clicked");
        for (let i = 0; i < markedBars.length; i++) {
            if (markedBars.place_id === bar.place_id) {
                console.log("i found a match --> I spliced");
                markedBars.splice(i, 1);
                return setShowMarkedBars(true);
            }
        }
        console.log("i didn't find a match --> pushed");
        markedBars.push(bar);
        setShowMarkedBars(true);
    };

    const handleChangeTitle = (e) => {
        // title = e.target.value;
        setTitle(e.target.value);
        console.log("title: ", title);
    };

    const handleChangeDescription = (e) => {
        // description = e.target.value;
        setDescription(e.target.value);
        console.log("description: ", description);
    };

    const handleChangeDate = (e) => {
        // date = e.target.value;
        setDate(e.target.value);
        console.log("start: ", date);
    };

    const handleChangeTime = (e) => {
        // time = e.target.value;
        setTime(e.target.value);
        console.log("time: ", time);
    };

    const handleChangeImg = async (e) => {
        let formData = new FormData();
        formData.append("file", e.target.files[0], eventId);
        try {
            const { data } = await axios.post(
                "/upload-event-picture",
                formData
            );
            console.log('data from "upload-event-picture": ', data);
            setEventPic(data.url);
        } catch (err) {
            console.log('ERROR in POST "upload-event-picture": ', err);
        }
    };

    const hostEvent = async () => {
        const dataObj = {
            eventId,
            title,
            description,
            date,
            time,
        };
        try {
            const { data } = await axios.post(
                "/update-event-description",
                dataObj
            );
            console.log(
                'POST "/update-event-description" --> eventDetails.js: ',
                data
            );
        } catch (err) {
            console.log(
                'ERROR in POST "update-event-data" --> eventDetails.js: ',
                err
            );
        }
    };

    const joinEvent = async () => {
        try {
            const { data } = await axios.post("/join-event", { eventId });
            console.log("join event: ", data);
        } catch (err) {
            console.log(
                'ERROR in POST "/join-event" --> eventdetails.js: ',
                err
            );
        }
    };

    const leaveEvent = async () => {
        try {
            const { data } = await axios.get(`/leave-event/${eventId}.json`);
            console.log("leave event: ", data);
        } catch (err) {
            console.log(
                `ERROR in POST "/leave-event/${eventId}.json" --> eventdetails.js: `,
                err
            );
        }
    };

    //setting a ref to the map instance so that map could be reused in other components
    const mapRef = useRef;
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    //checking if map loads correctly
    if (loadError) {
        return "ERROR loading Maps";
    }
    if (!isLoaded) {
        return "Loading Maps";
    }

    return (
        <div className="event-details">
            <div className="title">
                <input
                    className="title-input"
                    name="title"
                    type="title"
                    placeholder="What is the title of your tour?"
                    value={title && title}
                    onChange={(e) => handleChangeTitle(e)}
                />
            </div>
            <div className="date">
                <input
                    className="date-day"
                    name="date"
                    type="date"
                    placeholder="What day?"
                    value={date && date}
                    onChange={(e) => handleChangeDate(e)}
                />
                <input
                    className="date-time"
                    name="time"
                    type="time"
                    placeholder="What time?"
                    value={time && time}
                    onChange={(e) => handleChangeTime(e)}
                />
            </div>
            <div className="map-container">
                <div className="list">
                    {selectedBars.map((bar) => (
                        <div
                            className="list-item"
                            key={"event-details" + bar.place_id}
                            id={bar.place_id}
                            onClick={(bar) => {
                                markBarOnMap(bar);
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

                <div className="map">
                    {response && selectedBars && markerPosition && (
                        <GoogleMap
                            id="render-route_event-details_GoogleMap"
                            mapContainerStyle={mapContainerStyle}
                            zoom={10}
                            center={{
                                lat: markerPosition.lat,
                                lng: markerPosition.lng,
                            }}
                            onLoad={onMapLoad}
                            options={options}
                        >
                            {allowToRerender && (
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

                            {markedBars &&
                                showMarkedBars &&
                                markedBars.map((bar) => (
                                    <Marker
                                        key={bar.place_id}
                                        position={{
                                            lat: bar.geometry.location.lat,
                                            lng: bar.geometry.location.lng,
                                        }}
                                        // onClick={() => setSelectedBar(bar)}
                                        icon={{
                                            url:
                                                "./resources/media/cocktail-blue.png",
                                            scaledSize: new window.google.maps.Size(
                                                25,
                                                25
                                            ),
                                        }}
                                    />
                                ))}
                        </GoogleMap>
                    )}
                </div>
            </div>
            {participants && (
                <div className="participants">
                    {participants.map((user) => {
                        return (
                            <div key={user.id} className="participant-box">
                                <h3>
                                    {user.first} {user.last}
                                </h3>
                                <Link to={`/user/${user.id}`}>
                                    <img
                                        src={user.profile_picture_url}
                                        alt={`${user.first} ${user.last}`}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
            {eventPic && (
                <div className="event-pic">
                    <img src={eventPic} />
                </div>
            )}

            {userIsHost && (
                <div className="event-upload-img">
                    <input
                        id="uploadImgEvent"
                        type="file"
                        name="fileUpload"
                        accept="image/*"
                        placeholder="Add an event pic"
                        onChange={(e) => handleChangeImg(e)}
                    />
                    <label for="uploadImgEvent">Add an event pic</label>
                </div>
            )}
            <div className="description">
                <textarea
                    id="event-details-text"
                    name="textField"
                    rows="10"
                    cols="60"
                    value={description && description}
                    onChange={(e) => handleChangeDescription(e)}
                ></textarea>
            </div>
            {userIsHost && (
                <Link to="/events">
                    <button onClick={() => hostEvent()}>Host</button>
                </Link>
            )}
            {!userIsHost && !userIsParticipant && (
                <Link to="/participation-success">
                    <button onClick={() => joinEvent()}>Join</button>
                </Link>
            )}
            {!userIsHost && userIsParticipant && (
                <Link to="/participation-left">
                    <button onClick={() => leaveEvent()}>Leave</button>
                </Link>
            )}
        </div>
    );
}
