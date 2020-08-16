import React from "react";
import { Link } from "react-router-dom";

import axios from "./axios";

export default function HostOrGuest() {
    return (
        <div className="host-or-guest">
            <div className="sub-container-1">
                <div className="sub-container-1-1">
                    <h1>Guest or Host ?</h1>
                </div>
                <div className="sub-container-1-2">
                    <div className="guest">
                        <Link to="/events">
                            <img src="./resources/media/beer.png" />
                        </Link>
                        <p>Guest</p>
                    </div>
                    <div className="host">
                        <Link to="/host-event">
                            <img src="./resources/media/shaker.png" />
                        </Link>
                        <p>Host</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
