import * as io from "socket.io-client";

import {
    receiveChatHistory,
    addNewChatMessage,
    addCommonFriends,
    addNearbyPlaces,
} from "./actions";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        //retrieves the chat history on initial login from index.js --> io.sockets.emit("chatMessageHistory", rows)
        socket.on("chatMessageHistory", (chatHistory) => {
            store.dispatch(receiveChatHistory(chatHistory));
        });

        //retrieves new messages users are typing from index.js --> io.sockets.emit("addChatMsg", newMsg);
        socket.on("addChatMsg", (newMsg) => {
            store.dispatch(addNewChatMessage(newMsg));
        });

        //retrieving common friends list from index.js
        socket.on("Common Friends List", (commonFriends) => {
            store.dispatch(addCommonFriends(commonFriends));
        });

        //retrieving the first 20 results from Google Places
        socket.on("First 20 places", (searchResults) => {
            console.log("Search Results: ", searchResults);
            store.dispatch(addNearbyPlaces(searchResults));
        });
    }
};
