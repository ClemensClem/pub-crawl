// src/actions.js
//all of my action creator functions will be here
import axios from "./axios";

//function is the action creator
// "type: state" object is the action
//getting set of friends when "friends" function component mounts -->friends.js
export async function receiveFriends() {
    try {
        const { data } = await axios.get("/friends-wannabes");
        console.log("actions.js receiveFriends - data: ", data);
        //checks if there are results in the db-call
        if (!data) {
            return {
                type: "RECEIVE_FRIENDS",
                friends: {},
            };
        } else {
            return {
                type: "RECEIVE_FRIENDS",
                friends: data,
            };
        }
    } catch (err) {
        console.log("ERROR in actions.js - receiveFriends: ", err);
    }
}

//unfriend action -->friends.js
export async function unfriend(userProfileId) {
    try {
        const { data } = await axios.post(
            `/end-friendship/${userProfileId}.json`
        );
        console.log("actions.js unfriend - data: ", data);
        if (data.success) {
            console.log('"End Friendship"');
            return {
                type: "UNFRIEND",
                //Hippster syntax: in this case name of the property and the assigned key.value are the same
                userProfileId,
            };
        } else {
            console.log(` ERROR in POST "/end-friendship/${userProfileId}"`);
            return null;
        }
    } catch (err) {
        console.log("ERROR in actions.js - unfriend: ", err);
    }
}
//accept friend request action -->friends.js
export async function acceptFriendRequest(userProfileId) {
    try {
        const { data } = await axios.post(
            `/accept-friend-request/${userProfileId}.json`
        );
        console.log("actions.js acceptFriendRequest - data: ", data);
        if (data.success) {
            console.log('"Accept Friend-Request"');
            return {
                type: "ACCEPT_FRIEND_REQUEST",
                //Hippster syntax: in this case name of the property and the assigned key.value are the same
                userProfileId,
            };
        } else {
            console.log(
                ` ERROR in POST "/accept-friend-request/${userProfileId}.json"`
            );
            return null;
        }
    } catch (err) {
        console.log("ERROR in actions.js - acceptFriendRequest: ", err);
    }
}

//storing chat history --> socket.js
export async function receiveChatHistory(chatHistory) {
    return {
        type: "CHAT_HISTORY",
        //Hippster syntax: in this case name of the property and the assigned key.value are the same
        chatHistory: chatHistory,
    };
}

//adding new messages by clients
export async function addNewChatMessage(newMsg) {
    return {
        type: "CHAT_NEW_MESSAGE",
        //Hippster syntax: in this case name of the property and the assigned key.value are the same
        newMsg,
    };
}

export async function addCommonFriends(commonFriends) {
    return {
        type: "ADD_COMMON_FRIENDS",
        commonFriends,
    };
}

export async function addNearbyPlaces(nearbyPlaces) {
    return {
        type: "ADD_NEARBY_PLACES",
        nearbyPlaces,
    };
}

export async function addMarkerPosition(marker) {
    return {
        type: "ADD_MARKER_POSITION",
        marker,
    };
}

export async function selectBarFromList(bar) {
    return {
        type: "SELECT_BAR_FROM_LIST",
        bar,
    };
}

export async function selectBarFromSelection(bar) {
    return {
        type: "SELECT_BAR_FROM_SELECTION",
        bar,
    };
}

export async function addEventId(eventId) {
    return {
        type: "ADD_EVENT_ID",
        eventId,
    };
}

export async function addMarkerToMap(markedBars) {
    return {
        type: "ADD_MARKER_TO_MAP",
        markedBars,
    };
}
