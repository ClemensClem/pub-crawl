import React from "react";
import { Link } from "react-router-dom";

import axios from "./axios";

export default function ParticipationSuccess() {
    return (
        <div className="events-status">
            <h1>You successfully joined the event</h1>
            <p>See what other events are waiting for you</p>
            <Link to="/events">
                <img src="./resources/media/beer.png" />
            </Link>
        </div>
    );
}
