// src/reducer.js

export default function reducer(state = {}, action) {
    if (action.type == "RECEIVE_FRIENDS") {
        state = {
            ...state,
            friends: action.friends,
        };
    }

    if (action.type == "UNFRIEND") {
        state = {
            ...state,
            friends: state.friends.filter(
                (friend) => friend.id != action.userProfileId
            ),
        };
    }

    if (action.type == "ACCEPT_FRIEND_REQUEST") {
        state = {
            ...state,
            friends: state.friends.map((friend) => {
                if (friend.id != action.userProfileId) {
                    return friend;
                } else {
                    return {
                        ...friend,
                        accepted: true,
                    };
                }
            }),
        };
    }

    //receiveChatHistory
    if (action.type == "CHAT_HISTORY") {
        state = {
            ...state,
            chat: action.chatHistory,
        };
    }

    //adding new message
    if (action.type == "CHAT_NEW_MESSAGE") {
        state = {
            ...state,
            chat: [...state.chat, action.newMsg],
        };
    }

    if (action.type == "ADD_COMMON_FRIENDS") {
        state = {
            ...state,
            commonFriends: action.commonFriends,
        };
    }

    if (action.type == "ADD_NEARBY_PLACES") {
        state = {
            ...state,
            nearbyPlaces: action.nearbyPlaces,
            selectedBars: [],
        };
    }

    if (action.type == "ADD_MARKER_POSITION") {
        state = {
            ...state,
            markerPosition: action.marker,
        };
    }

    if (action.type == "SELECT_BAR_FROM_LIST") {
        state = {
            ...state,
            nearbyPlaces: {
                ...state.nearbyPlaces,
                bars: state.nearbyPlaces.bars.filter(
                    (bar) => bar.place_id != action.bar.place_id
                ),
            },
            selectedBars: [...state.selectedBars, action.bar],
        };
    }

    if (action.type == "SELECT_BAR_FROM_SELECTION") {
        state = {
            ...state,
            nearbyPlaces: {
                ...state.nearbyPlaces,
                bars: [...state.nearbyPlaces.bars, action.bar],
            },
            selectedBars: state.selectedBars.filter(
                (bar) => bar.place_id != action.bar.place_id
            ),
        };
    }

    if (action.type == "ADD_EVENT_ID") {
        state = {
            ...state,
            eventId: action.eventId,
        };
    }

    if (action.type == "ADD_MARKER_TO_MAP") {
        state = {
            ...state,
            markedBars: action.markedBars,
        };
    }

    return state;
}

//alternative syntax for changing state:
////////////////////////////////////////
//          state = Object.assign({}, state, {
//     users: action.users,
//          });
