import React from "react";
import { Link } from "react-router-dom";

import axios from "./axios";

export default function ParticipationLeft() {
    return (
        <div className="events-status">
            <h1>You left the event</h1>
            <p>Maybe you want to look for another event?</p>
            <Link to="/events">
                <img src="./resources/media/beer.png" />
            </Link>
        </div>
    );
}
