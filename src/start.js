import React from "react";
import ReactDOM from "react-dom";

import Welcome from "./welcome";
import App from "./app";

/////////////
///socket.io

import { init } from "./socket";

///End socket.io
////////////////

//////////////
//Redux Set-up

import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import reduxPromise from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducer";

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

//End Redux Set-up
//////////////////

let elem;
const userIsLoggedIn = location.pathname != "/welcome";

if (!userIsLoggedIn) {
    elem = <Welcome />;
} else {
    //this gives socket.io access to the redux store
    init(store);
    //all after "elem=" is from the redux set-up
    elem = (
        <Provider store={store}>
            <App />
        </Provider>
    );
}

//Can only be called once per project
ReactDOM.render(elem, document.querySelector("main"));
