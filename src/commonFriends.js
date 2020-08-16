import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { socket } from "./socket";
import { useSelector } from "react-redux";

export default function CommonFriends({ userProfileId }) {
    const commonFriends = useSelector(
        (state) => state.commonFriends && state.commonFriends
    );

    //useSelector for list
    //displaying list in function component

    useEffect(() => {
        //receiving common friends
        socket.emit("Common Friends", userProfileId);
    }, []);

    return (
        <div className="commonFriendsContainer">
            {commonFriends && commonFriends.length > 0 && (
                <h1>You both share common friends</h1>
            )}
            <div className="commonFriendsContainer-subContainer">
                {commonFriends &&
                    commonFriends.map((friend) => {
                        return (
                            <div className="userBox" key={friend.id}>
                                <h3>
                                    {friend.first} {friend.last}
                                </h3>
                                <Link to={`/user/${friend.id}`}>
                                    <img
                                        src={friend.profile_picture_url}
                                        alt={`${friend.first} ${friend.last}`}
                                    />
                                </Link>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
