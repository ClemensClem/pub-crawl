import React, { useState, useEffect } from "react";
import axios from "./axios";

//one can use (props) or use destructering for assigning the prop to a variable directly
//userProfileId is the id of the profile-page of some user the logged-in user is visiting
export default function FriendButton({ userProfileId }) {
    //four states can be assigned:
    //"Make Friend Request" --> no entry in friendships table
    //"Accept Friend Request" --> accepted= false in friendships table --> receiver perspective
    //"Cancel Friend Request" --> accepted= false in friendships table --> sender perspective
    //"End Friendship" --> accepted= true in friendships table
    const [friendshipState, setFriendshipState] = useState("");

    const [error, setError] = useState(false);

    //should only run when component mounts, for this reason an empty array is passed to the function
    useEffect(() => {
        (async () => {
            try {
                let { data } = await axios.get(
                    `/get-status-of-friendship/${userProfileId}.json`
                );
                if (!data.success) {
                    setError(true);
                } else {
                    setFriendshipState(data.result);
                }
            } catch (err) {
                (err) => {
                    console.log("hook useComponentMounts --> ERROR: ", err);
                    setError(true);
                };
            }
        })();
    }, []);

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            if (e.target.innerText === "Make Friend Request") {
                const { data } = await axios.post(
                    `/make-friend-request/${userProfileId}.json`
                );
                if (data.success) {
                    setFriendshipState(data.nextFriendshipStatus);
                    console.log(
                        '"Make Friend Request" --> next: ',
                        friendshipState
                    );
                } else {
                    console.log(
                        ` ERROR in POST "/make-friend-request/${userProfileId}"`
                    );
                    setError(true);
                }
                //
            } else if (
                e.target.innerText === "End Friendship" ||
                e.target.innerText === "Cancel Friend Request"
            ) {
                const { data } = await axios.post(
                    `/end-friendship/${userProfileId}.json`
                );

                if (data.success) {
                    setFriendshipState(data.nextFriendshipStatus);
                    console.log('"End Friendship" --> next: ', friendshipState);
                } else {
                    console.log(
                        ` ERROR in POST "/end-friendship/${userProfileId}"`
                    );
                    setError(true);
                }
                //
            } else if (e.target.innerText === "Accept Friend Request") {
                const { data } = await axios.post(
                    `/accept-friend-request/${userProfileId}.json`
                );
                if (data.success) {
                    setFriendshipState(data.nextFriendshipStatus);
                    console.log(
                        '"Accept Friend Request" --> next: ',
                        friendshipState
                    );
                } else {
                    console.log(
                        ` ERROR in POST "/accept-friend-request/${userProfileId}"`
                    );
                    setError(true);
                }
            }
            //
        } catch (err) {
            console.log("ERROR in friendButton.js - handleClick: ", err);
            setError(true);
        }
    };

    return (
        <div>
            {error && (
                <p className="errorMessage">
                    Sorry, something went wrong, please try again
                </p>
            )}
            <button onClick={handleClick}>{friendshipState}</button>
        </div>
    );
}
