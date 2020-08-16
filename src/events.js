import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "./axios";

export default function Events() {
    const [events, setEvents] = useState();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get("/get-events");
                setEvents(data);
                console.log("get-events: ", data);
            } catch (err) {
                console.log('ERROR in GET "/get-events" --> events.js: ', err);
            }
        })();
    }, []);

    return (
        <div className="events">
            <h1>Tours</h1>
            <div className="events-container">
                {events &&
                    events.map((event) => {
                        return (
                            <div key={event.id} className="event-box">
                                <h3>{event.title}</h3>
                                <Link to={`/event-details/${event.id}`}>
                                    <img
                                        src={event.event_picture_url}
                                        alt={`${event.title}`}
                                    />
                                    <p>
                                        {event.start_date} at {event.start_time}
                                    </p>
                                    <p>
                                        Host: {event.first} {event.last}
                                    </p>
                                </Link>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
