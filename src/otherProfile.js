import React, { useState, useEffect } from "react";
import axios from "./axios";

import FriendButton from "./friendButton";
import CommonFriends from "./commonFriends";

export default function OtherProfile({ match, history }) {
    const [otherProfileUserData, setOtherProfileUserData] = useState({});
    const [error, setError] = useState(false);

    const otherUserId = match.params.id;

    useEffect(() => {
        //assigning the id of user which profile will be rendered
        //"this.props.match.params.id" contains the "id"-part of the url that is called
        (async () => {
            try {
                const { data } = await axios.get(`/user/${otherUserId}.json`);
                //logged in user is the same like the user which profile has been requested --> check is done on server side in index.js
                if (data.userEqualsProfile) {
                    history.push("/");
                } else {
                    console.log("data: ", data);
                    setOtherProfileUserData(data);
                }
            } catch (err) {
                console.log(`Error in GET "/user/${otherUserId}.json": `, err);
                setError(true);
            }
        })();
    }, []);

    return (
        <div className="otherUserProfile">
            {error && (
                <p className="error">
                    Something went wrong, please try again...
                </p>
            )}
            <h1>
                {otherProfileUserData.first} {otherProfileUserData.last}
            </h1>
            <img src={otherProfileUserData.profile_picture_url} />
            <div className="otherBio">
                <p>{otherProfileUserData.bio}</p>
            </div>
            <FriendButton userProfileId={otherUserId} />
            <CommonFriends userProfileId={otherUserId} />
        </div>
    );
}
