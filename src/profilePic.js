import React from "react";
import { Link } from "react-router-dom";

//using destructering to extract key values from props object
export default function ProfilePic({
    first,
    last,
    profile_picture_url,
    toggleModal,
    size,
}) {
    //checks if an url for the profile picture is existing, if not then the default is rendered
    profile_picture_url = profile_picture_url || "./resources/media/user.png";

    if (size === "large") {
        return (
            <div className="profilePicLarge">
                <img src={profile_picture_url} onClick={toggleModal} />
            </div>
        );
    } else {
        return (
            <div className="profilePic">
                <Link to="/">
                    <img src={profile_picture_url} />
                </Link>
            </div>
        );
    }
}
