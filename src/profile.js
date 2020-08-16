import { Link } from "react-router-dom";
import React from "react";

import ProfilePic from "./profilePic.js";
import BioEditor from "./bioEditor.js";

export default function Profile({
    first,
    last,
    email,
    profile_picture_url,
    bio,
    toggleModal,
    updateBio,
}) {
    return (
        <div className="userProfile">
            <h1>
                Hello {first} {last}
            </h1>
            <ProfilePic
                first={first}
                last={last}
                profile_picture_url={profile_picture_url}
                toggleModal={toggleModal}
                // clickHandler={props.clickHandler}
                size="large"
            />
            <BioEditor bio={bio} updateBio={updateBio} />
        </div>
    );
}
