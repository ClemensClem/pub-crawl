import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function NavigationMenuHeader({
    navigationMenuVisible,
    toggleNavigationMenu,
}) {
    const node = useRef();

    const handleClickOutside = (e) => {
        if (
            node.current.contains(e.target) ||
            e.target.className === "navigationIconHeader"
        ) {
            // inside click
            return;
        }
        // outside click
        toggleNavigationMenu();
    };

    useEffect(() => {
        if (navigationMenuVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [navigationMenuVisible]);

    return (
        <div ref={node} className="navigationMenuHeader">
            <Link to="/profile">
                <p>My Profile</p>
            </Link>
            <Link to="/friends">
                <p>My Connects</p>
            </Link>
            <Link to="/users">
                <p>Find Friends</p>
            </Link>
            <Link to="/chat">
                <p>Community Chat</p>
            </Link>
            <Link to="/host-event">
                <p>Hosting an Event</p>
            </Link>
            <Link to="/events">
                <p>Check Events</p>
            </Link>
            <a href="/logout">
                <p>Logout</p>
            </a>
        </div>
    );
}
