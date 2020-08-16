import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { receiveFriends, unfriend, acceptFriendRequest } from "./actions";

export default function Friends() {
    const dispatch = useDispatch();

    //all kinds of current friendship relations
    const friends = useSelector((state) => state.friends);

    const currentFriends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );

    const wannabeFriends = useSelector(
        (state) =>
            state.friends &&
            state.friends.filter(
                (friend) => !friend.accepted && friend.sender_id === friend.id
            )
    );

    const pendingFriends = useSelector(
        (state) =>
            state.friends &&
            state.friends.filter(
                (friend) => !friend.accepted && friend.sender_id != friend.id
            )
    );

    useEffect(() => {
        dispatch(receiveFriends());
    }, []);

    console.log("Current friends: ", currentFriends);
    console.log("Wannabes: ", wannabeFriends);
    console.log("Pending: ", pendingFriends);

    if (!friends) {
        return (
            <div className="friendsList">
                <h3>You should find some friends</h3>
                <Link to="/users">
                    <p>Find Friends</p>
                </Link>
            </div>
        );
    } else {
        return (
            <div className="friendsList">
                <div className="friendsContainer">
                    {currentFriends && currentFriends.length > 0 && (
                        <h1>Your Friends</h1>
                    )}
                    <div className="friendsContainer_subContainer">
                        {currentFriends &&
                            currentFriends.map((user) => {
                                return (
                                    <div key={user.id} className="userBox">
                                        <h3>
                                            {user.first} {user.last}
                                        </h3>
                                        <Link to={`/user/${user.id}`}>
                                            <img
                                                src={user.profile_picture_url}
                                                alt={`${user.first} ${user.last}`}
                                            />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                dispatch(unfriend(user.id))
                                            }
                                        >
                                            Unfriend
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className="friendsContainer">
                    {wannabeFriends && wannabeFriends.length > 0 && (
                        <h1>They want to become friends</h1>
                    )}
                    <div className="friendsContainer_subContainer">
                        {wannabeFriends &&
                            wannabeFriends.map((user) => {
                                return (
                                    <div key={user.id} className="userBox">
                                        <h3>
                                            {user.first} {user.last}
                                        </h3>
                                        <Link to={`/user/${user.id}`}>
                                            <img
                                                src={user.profile_picture_url}
                                                alt={`${user.first} ${user.last}`}
                                            />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                dispatch(
                                                    acceptFriendRequest(user.id)
                                                )
                                            }
                                        >
                                            Accept
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className="friendsContainer">
                    {pendingFriends && pendingFriends.length > 0 && (
                        <h1>Pending friend requests</h1>
                    )}
                    <div className="friendsContainer_subContainer">
                        {pendingFriends &&
                            pendingFriends.map((user) => {
                                return (
                                    <div key={user.id} className="userBox">
                                        <h3>
                                            {user.first} {user.last}
                                        </h3>
                                        <Link to={`/user/${user.id}`}>
                                            <img
                                                src={user.profile_picture_url}
                                                alt={`${user.first} ${user.last}`}
                                            />
                                        </Link>

                                        <button
                                            onClick={() =>
                                                dispatch(unfriend(user.id))
                                            }
                                        >
                                            Cancel Friend-Request
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        );
    }
}
